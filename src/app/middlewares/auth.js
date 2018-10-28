const jwt = require('jsonwebtoken');

//Busca Secret
const authConfig = require('../../config/auth');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).send( { error: 'No token provided'} );

    // Bearer hash893fjw834ru2389ru923r23
    const parts = authHeader.split(' ');
    if(!parts.length === 2)
        return res.status(401).send( { error: 'Token error'} );

    const [ scheme, token ] = parts;

    if(!/^Bearer$/i.test(scheme))
        return res.status(401).send( { error: 'Malformatted Token'} );

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err)
            return res.status(401).send( { error: 'Invalid token'} );

        req.userId = decoded.id;
        return next();
    });

};