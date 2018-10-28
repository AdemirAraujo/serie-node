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
    try{
        const projects = await Project.find().populate('user');
        return res.send({ projects });
    } catch(err) {
        return res.status(400).send( { error: 'Error loading Projects', err} );
    }
});

//Lista 1 Projeto
router.get('/:projectId', async (req, res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate('user');
        return res.send({ project });
    } catch(err) {
        return res.status(400).send( { error: 'Error loading Project', err} );
    }
});

//Create Project
router.post('/', async (req, res) => {
    try{
        const {title, description, tasks } = req.body;
        
        //Cria o Projeto
        const project = await Project.create({ title, description, user: req.userId });

        //Cria os Tasks
        await Promise.all(tasks.map( async task => {
            const projectTask = new Task({ ...task, project: project._id });
            await projectTask.save();
            project.task.push(projectTask);
        }));

        //Salva o Projeto
        await project.save();

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
    try{
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send();
    } catch(err) {
        return res.status(400).send( { error: 'Error deleting Project', err} );
    }
});

module.exports = app => app.use('/projects', router);