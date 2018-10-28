const express = require('express');

//Middleware de validacao do Token
const authMiddleware = require('../middlewares/auth');

//Rotas
const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
    res.send({ ok: true, user: req.userId });

});

module.exports = app => app.use('/projects', router);