const express = require('express');

//Middleware de validacao do Token
const authMiddleware = require('../middlewares/auth');

//Importar modelos
const Project = require('../models/Project');
const Task = require('../models/Task');


//Rotas
const router = express.Router();
router.use(authMiddleware);

//Listar
router.get('/', async (req, res) => {
    res.send({ user: req.userId });
});

//Lista 1 Projeto
router.get('/:projectId', async (req, res) => {
    res.send({ user: req.userId });
});

//Create Project
router.post('/', async (req, res) => {
    try{
        const project = await Project.create(req.body);
        return res.send({ project });
    } catch(err) {
        return res.status(400).send( { error: 'Error creating new Project', err} );
    }
});

//Atualizar
router.put('/:projectId', async (req, res) => {
    res.send({ user: req.userId });
});

//Deletar
router.delete('/:projectId', async (req, res) => {
    res.send({ user: req.userId });
});

module.exports = app => app.use('/projects', router);