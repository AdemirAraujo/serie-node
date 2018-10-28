const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

// Obter o modelo de User
const User = require('../models/User');

//Busca Secret
const authConfig = require('../../config/auth');

//Gera Token
function generateToken(params = {})
{
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

//Rotas
const router = express.Router();

//Registrar um usuario
router.post('/register', async(req, res) => {
    const { email } = req.body;

    try {
        // Testa se o uxuario ja existe
        if ( await User.findOne( {email}) )
            return res.status(400).send( { error: 'User already exists'} );

        const user = await User.create(req.body);
        user.password = undefined;   // Remover o retorno da senha
        return res.send({ 
            user,
            token: generateToken({id: user.id}),
        });
    
    } catch(err) {
    
        return res.status(400).send( { error: 'Registration failed'} );
    
    }

});

//Autenticacao
router.post('/authenticate', async(req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email}).select('+password');
    
    // Usuario nao encontrado
    if(!user)
        return res.status(400).send( { error: 'User not found'} );

    //Senha invalida
    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send( { error: 'Invalid password'} );

    user.password = undefined;   // Remover o retorno da senha

    res.send({ 
        user, 
        token: generateToken({id: user.id}),
     });
} );

//Forgot Password
router.post('/forgot_password', async(req,res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        
        //Se nao encontrou o usuario
        if(!user)
            return res.status(400).send( { error: 'User not found'} );

        const token = crypto.randomBytes(20).toString('hex');
        
        //Tempo de expiracao
        const now = new Date();
        now.setHours(now.getHours() + 1);

        //Seta o tempo para o Model
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        //console.log(token,now);
        
        mailer.sendMail({
            to: email,
            from: 'ademir_a@gmail.com',
            template: 'auth/forgot_password',
            context: { token }
        }, (err) => {
            //Exibe a mensagem de erro
            if(err) {
                console.log(err);
                return res.status(400).send( { error: 'Cannot send forgot password email'} );
            }

            //Se nao teve erro, retorna 200
            return res.send();
        });


    } catch(err) {
        return res.status(400).send( { error: 'Error on forgot_password, try again'} );
    }
});

router.post('/reset_password', async(req,res) => {
    const { email, token, password } = req.body;
    try {
        const user = await User.findOne({ email })
        .select('+passwordResetToken passwordResetExpires');

        //Se nao encontrou o usuario
        if(!user)
            return res.status(400).send( { error: 'User not found'} );

        //Token invalido
        if(token != user.passwordResetToken)
            return res.status(400).send( { error: 'Invalid Token'} );

        const now = new Date();

        //Token expirado
        if(now > user.passwordResetExpires)
            return res.status(400).send( { error: 'Token expired, generate a new one'} );

        // Altera e grava o password
        user.password = password;
        await user.save();

        res.send();
        
    } catch(err) {
        return res.status(400).send( { error: 'Cannot reset password, try again'} );
    }
});

module.exports = app => app.use('/auth', router);