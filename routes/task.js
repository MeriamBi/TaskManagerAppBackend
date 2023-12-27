import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import { createTask, deleteBulkTasks, deleteTask, filterTasks, findAllTasks, findById, getTaskCountByCategory, getTaskCountByPriority, getTaskCountByStatus, getTotalTaskCount, markDone, searchTasks, updateTask } from '../controllers/task.controller.js';

const router = express.Router();

router.route('/')
    .post(
        multer('image'),
        body('title').isLength({ min: 5, max: 50 }),
        body('description').isLength({ min: 5, max: 255 }),
        body('status').isIn(['To Do', 'In Progress', 'Done']),
        body('priority').isIn(['High', 'Medium', 'Low']),
        body('category').isIn(['Work', 'Personal', 'Errands']),
        body('startDate').isISO8601().toDate(),
        body('dueDate').isISO8601().toDate(),
        createTask
    )
    .get(findAllTasks);

router.route('/deteleMultiple')
    .delete(deleteBulkTasks);

/** SEARCH **/
router.route('/search')
    .get(searchTasks);

/** FILTERS **/
router.route('/filter')
    .get(filterTasks);

/** STATISTICS **/
router.route('/statistics/totalTasks')
    .get(getTotalTaskCount)

router.route('/statistics/status/:status')
    .get(getTaskCountByStatus)

router.route('/statistics/priority/:priority')
    .get(getTaskCountByPriority)

router.route('/statistics/category/:category')
    .get(getTaskCountByCategory)

router.route('/:id')
    .put(
        multer("image"),
        [
            body('title').isLength({ min: 5, max: 50 }),
            body('description').isLength({ min: 5, max: 255 }),
            body('status').isIn(['To Do', 'In Progress', 'Done']),
            body('priority').isIn(['High', 'Medium', 'Low']),
            body('category').isIn(['Work', 'Personal', 'Errands']),
            body('startDate').isISO8601().toDate(),
            body('dueDate').isISO8601().toDate(),
        ],
        updateTask
    )
    .delete(deleteTask)
    .get(findById)
    .patch(markDone);

export default router;