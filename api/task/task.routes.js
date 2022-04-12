const express = require('express');
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware');
const { log } = require('../../middlewares/logger.middleware');
const { getTasks, getTaskById, addTask, updateTask, removeTask, startTask, toggleWorker, } = require('./task.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/runworker', toggleWorker)
router.get('/', log, getTasks);
router.get('/:id', getTaskById);


// TODO AFTER ALL WORKS! - these funcs with require authorize - should be on task!:
// router.post('/', requireAuth, requireAdmin, addTask)
// router.put('/', requireAuth, requireAdmin, updateTask)
// router.delete('/:id', requireAuth, requireAdmin, removeTask)
// OPTIONAL - router.post('/send',  log, sendMail)

//FOR CHECKING ONLY WITHOUT AUTH!!
router.post('/', addTask);
router.put('/:id', updateTask);
router.put('/:id/start', startTask);
router.delete('/:id', removeTask);


module.exports = router;