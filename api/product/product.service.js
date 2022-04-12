const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const externalService = require('../../services/external.service');
const socketService = require('../../services/socket.service')
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    performTask,
    runWorker,
    setWorkerState,
};

var isWorkerOn = false;

// THIS IS FOR LOCAL SERVER +  JSON DB!
// const fs = require('fs')
// const gTasks = require('../../data/task.json')
// function _saveTasksToFile() {
//     return new Promise((resolve, reject) => {
//         fs.writeFile('data/task.json', JSON.stringify(gTasks, null, 2), (err) => {
//             if (err) return reject(err)
//             resolve();
//         })
//     })
// }




async function query(filterBy) {
    // FOR MONGO + SERVER:
    try {
        // const criteria = _buildCriteria(filterBy)
        const criteria = {};

        const collection = await dbService.getCollection('product');
        // console.log('collectioncollection', collection);
        var tasks = await collection.find(criteria).toArray();
        // tasks.sort((task1, task2) => task2.price - task1.price) WORKING!
        return tasks;
    } catch (err) {
        // logger.error('cannot find tasks', err);
        throw err;
    }
    // FOR LOCAL DB + SERVER:
    // try {
    //     // const regex = new RegExp(filterBy.title, 'i')
    //     // var bugs = gBugs.filter(bug => regex.test(bug.title))

    //     return gTasks
    // } catch (err) {
    //     logger.error('cannot find tasks', err)
    //     throw err
    // }
}

async function getById(taskId) {
    //  FOR MONGO + SERVER:
    // console.log('taskId:', taskId)
    try {
        const collection = await dbService.getCollection('task');
        const task = collection.findOne({ '_id': ObjectId(taskId) });
        return task;
    } catch (err) {
        logger.error(`while finding task ${taskId}`, err);
        throw err;
    }

    // FOR LOCAL DB + SERVER:
    // try {
    //     const task = gTasks.find(task => task._id === taskId)
    //     return task
    // } catch (err) {
    //     logger.error(`while finding task ${taskId}`, err)
    //     throw err
    // }
}

async function remove(taskId) {
    // FOR MONGO + SERVER:
    try {
        const collection = await dbService.getCollection('task');
        await collection.deleteOne({ '_id': ObjectId(taskId) });
        socketService.updateTasks()
        return taskId;
    } catch (err) {
        logger.error(`cannot remove task ${taskId}`, err);
        throw err;
    }

    // FOR LOCAL DB + SERVER:
    // try {
    //     var removeIdx = gTasks.findIndex(task => task._id === taskId)
    //     gTasks.splice(removeIdx, 1)
    //     _saveTasksToFile()
    //     return taskId
    // } catch (err) {
    //     logger.error('cannot insert task', err)
    //     throw err
    // }
}

async function add(task) {
    // FOR MONGO + SERVER:
    try {
        const collection = await dbService.getCollection('task');
        const addedTask = await collection.insertOne(task);
        socketService.updateTasks()
        return addedTask;
    } catch (err) {
        logger.error('cannot insert task', err);
        throw err;
    }

    // FOR LOCAL DB + SERVER:
    // try {
    //     gTasks.push(task)
    //     _saveTasksToFile()
    //     return task
    // } catch (err) {
    //     logger.error('cannot insert task', err)
    //     throw err
    // }
}

async function update(task) {
    // FOR MONGO + SERVER:

    try {
        var id = ObjectId(task._id);
        delete task._id;
        const collection = await dbService.getCollection('task');
        await collection.updateOne({ "_id": id }, { $set: {...task } });
        task._id = id;
        socketService.updateTasks()
        return task;
    } catch (err) {
        logger.error(`cannot update task ${taskId}`, err);
        throw err;
    }

    // FOR LOCAL DB + SERVER:
    // try {
    //     var updateIdx = gTasks.findIndex(taskFromTasks => taskFromTasks._id === task._id)
    //     gTasks[updateIdx] = task
    //     _saveTasksToFile()
    //     return task
    // } catch (err) {
    //     logger.error('cannot insert task', err)
    //     throw err
    // }


}

async function performTask(task) {
    try {
        console.log('uploaded task:', task);
        // TODO: update task status to running and save to DB
        task.status = 'running';
        await update(task);

        // TODO: execute the task using: externalService.execute
        await externalService.execute();

        // TODO: update task for success (doneAt, status)
        task.status = 'done';
        task.doneAt = Date.now();
    } catch (error) {
        // TODO: update task for error: status, errors
        task.status = 'failed';
        if (task.errors.length) task.errors.push(error);
        else task.errors = [error];
    } finally {
        // TODO: update task lastTried, triesCount and save to DB
        task.triesCount++;
        task.lastTriedAt = Date.now();
        await update(task);
        logger.info('performTask');
        return task;
    }
}

async function setWorkerState() {
    isWorkerOn = !isWorkerOn
    await runWorker()
}

async function runWorker() {

    // The isWorkerOn is toggled by the button: "Start/Stop Task Worker"
    console.log('isWorkingOn:', isWorkerOn);
    if (!isWorkerOn) return;
    console.log('is this actually happening?')
    var delay = 1000;
    try {
        const task = await getNextTask();
        if (task) {
            try {
                await performTask(task);
            } catch (err) {
                console.log(`Failed Task`, err);
            } finally {
                delay = 1;
            }
        } else {
            console.log('Snoozing... no tasks to perform');
        }
    } catch (err) {
        console.log(`Failed getting next task to execute`, err);
    } finally {
        console.log('last move in loop');
        setTimeout(runWorker, delay);
    }
}

async function getNextTask() {
    console.log('getting your next task');
    const sortedTasks = await query();
    sortedTasks.map(task => {
        if (task.errors.length > 5) sortedTasks.splice(sortedTasks.indexOf(task), 1);
    });
    sortedTasks.sort((taskA, taskB) => taskA.errors.length - taskB.errors.length);
    //TODO - add hightest importance

    // console.log('sortedTasks:', sortedTasks)
    // console.log('sortedTasks[0]:', sortedTasks[0])
    return sortedTasks[0];
}