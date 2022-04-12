const taskService = require('./task.service.js');
const logger = require('../../services/logger.service')
    // Importing chalk module
const chalk = require("chalk");
const { set } = require('express/lib/application');

module.exports = {
    getTasks,
    getTaskById,
    addTask,
    updateTask,
    removeTask,
    startTask,
    toggleWorker,

}

// GET LIST
async function getTasks(req, res) {
    try {
        var queryParams = req.query;
        const tasks = await taskService.query(queryParams)
        console.log(chalk.green('got your tasks from server!'));
        // console.log('taskstaskstasks', tasks);
        res.json(tasks);
    } catch (err) {
        logger.error(chalk.red('Failed to get tasks'), err)
        res.status(500).send({ err: 'Failed to get tasks' })
    }

    // FOR MONGO + SERVER + also need filter!:
    // try {
    //     var queryParams = req.query;
    //     const tasks = await taskService.query(queryParams)
    //     res.json(tasks);
    // } catch (err) {
    //     logger.error('Failed to get tasks', err)
    //     res.status(500).send({ err: 'Failed to get tasks' })
    // }
}

// GET BY ID 
async function getTaskById(req, res) {
    try {
        // console.log('Backend getting your TaskById:', req.params.id);
        const taskId = req.params.id;
        const task = await taskService.getById(taskId)
        res.json(task)
    } catch (err) {
        logger.error(chalk.red('Failed to get task'), err)
        res.status(500).send({ err: 'Failed to get task' })
    }

    // FOR MONGO + SERVER:
    // try {
    //     const taskId = req.params.id;
    //     const task = await taskService.getById(taskId)
    //     res.json(task)
    // } catch (err) {
    //     logger.error('Failed to get task', err)
    //     res.status(500).send({ err: 'Failed to get task' })
    // }
}

// POST (add task)
async function addTask(req, res) {
    try {
        console.log('Backend putting your task:');
        const comingTask = req.body;
        const addedTask = await taskService.add(comingTask)
        res.json(addedTask)
    } catch (err) {
        logger.error(chalk.red('Failed to add task'), err)
        res.status(500).send({ err: 'Failed to add task' })
    }
    // FOR MONGO + SERVER:
    // try {
    //     const task = req.body;
    //     const addedTask = await taskService.add(task)
    //     res.json(addedTask)
    // } catch (err) {
    //     logger.error('Failed to add task', err)
    //     res.status(500).send({ err: 'Failed to add task' })
    // }
}

// PUT (Update task)
async function updateTask(req, res) {
    console.log('Backend updating your task:');
    try {
        console.log('Backend updating your task:');
        const comingTask = req.body;
        // console.log('comingTask', comingTask);
        const updatedTask = await taskService.update(comingTask)
        res.json(updatedTask)
    } catch (err) {
        logger.error(chalk.red('Failed to update task'), err)
        res.status(500).send({ err: 'Failed to update task' })
    }
    // FOR MONGO + SERVER:
    // try {
    //     const task = req.body;
    //     const updatedTask = await taskService.update(task)
    //     res.json(updatedTask)
    // } catch (err) {
    //     logger.error('Failed to update task', err)
    //     res.status(500).send({ err: 'Failed to update task' })
    // }
}

// DELETE (Remove task)
async function removeTask(req, res) {
    try {
        const taskId = req.params.id;
        console.log('Backend Removing your task:', taskId);
        const removedId = await taskService.remove(taskId)
        res.json(removedId)
    } catch (err) {
        logger.error(chalk.red('Failed to remove task'), err)
        res.status(500).send({ err: 'Failed to remove task' })
    }

    // FOR MONGO + SERVER: look like the same as local
    // try {
    //     const taskId = req.params.id;
    //     const removedId = await taskService.remove(taskId)
    //     res.send(removedId)
    // } catch (err) {
    //     logger.error('Failed to remove task', err)
    //     res.status(500).send({ err: 'Failed to remove task' })
    // }
}

// Perform task BY ID 
async function startTask(req, res) {
    try {
        const taskId = req.params.id;
        let task = await taskService.getById(taskId)
        // console.log('controller - before performTask', task)
        task = await taskService.performTask(task)
        // console.log('controller - after performTask', task)
        res.json(task)
    } catch (err) {
        logger.error(chalk.red('controller catch - Failed to get task'), err)
        res.status(500).send({ err: 'Failed to get task' })
    }
}

// toggleWorker
async function toggleWorker(req, res) {
    try {
        console.log(req.query.params)
        const workerState = (req.query.params)
        taskService.setWorkerState()
        // taskService.runWorker()
    } catch (error) {
        
    }
}


