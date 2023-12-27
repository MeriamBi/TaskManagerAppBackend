import Task from '../models/task.js';
import { validationResult } from 'express-validator';

/** CRUD **/
export function createTask(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    } else {
        const task = new Task({
            ...req.body,
            image: `${req.protocol}://${req.get('host')}/img/${req.file.filename}`,
        });
        task.save()
            .then(doc => res.status(201).json({ doc }))
            .catch(error => res.status(500).send({ message: "Internal Server Error!" }));
    }
}

export function findAllTasks(req, res) {
    const { page, pageSize } = getPaginationParams(req);

    Task.paginate({}, { page, limit: pageSize })
        .then(result => {
            res.status(200).json({
                page: result.page,
                pageSize: result.limit,
                totalItems: result.docs.length,
                data: result.docs
            });
        })
        .catch(error => res.status(500).send({ message: "Internal Server Error!" }));
}

export function findById(req, res) {
    let id = req.params.id;
    Task.findById(id)
        .then(
            (doc) => {
                if (doc) {
                    res.status(200).json({ doc });
                } else {
                    return res.status(404).send({ message: "Task not found" });
                }
            }
        )
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

export function updateTask(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    const update = { ...req.body };
    if (req.file) {
        update.image = `${req.protocol}://${req.get('host')}/img/${req.file.filename}`;
    }
    const options = { new: true }; // Return the updated document
    Task.findByIdAndUpdate(id, update, options)
        .then(doc => {
            if (doc) {
                res.status(200).send({ message: "Task updated!", doc });
            } else {
                res.status(404).send({ message: "Task not found" });
            }
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

// mark a task as done
export function markDone(req, res) {
    const id = req.params.id;
    const options = { new: true }; // Return the updated document
    Task.findByIdAndUpdate(
        id,
        {
            $set: {
                completionFlag: true,
                status: 'Done'
            }
        },
        options
    )
        .then(doc => {
            if (doc) {
                res.status(200).json({ doc });
            } else {
                res.status(404).send("Task not found");
            }
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

// delete one task
export function deleteTask(req, res) {
    const id = req.params.id;
    Task.findByIdAndDelete(id)
        .then(doc => {
            if (doc) {
                res.status(204).send({ message: "Task deleted" });
            } else {
                res.status(404).send({ message: "Task not found" });
            }
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

// delete many tasks at once
export function deleteBulkTasks(req, res) {
    const ids = req.body.ids;
    console.log("heyy");
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid task ids array' });
    }
    Task.deleteMany({
        _id: { $in: ids }
    })
        .then(docs => {
            res.status(204).json({ message: `${docs.deletedCount} tasks deleted` });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

/** SEARCH **/
// search for tasks by title or description
export function searchTasks(req, res) {
    const keyword = req.query.keyword;
    const { page, pageSize } = getPaginationParams(req);

    const query = {
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
        ]
    };

    Task.paginate(query, { page, limit: pageSize })
        .then(result => {
            res.status(200).json({
                page: result.page,
                pageSize: result.limit,
                totalItems: result.docs.length,
                data: result.docs
            });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

/** FILTERS **/
//filter tasks by status and/or priority and/or category and/or start date and/or due date
export function filterTasks(req, res) {
    const filters = {};
    if (req.query.status) {
        filters.status = req.query.status;
    }
    if (req.query.priority) {
        filters.priority = req.query.priority;
    }
    if (req.query.category) {
        filters.category = req.query.category;
    }

    if (req.query.startDate) {
        filters.startDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.dueDate) {
        filters.dueDate = { $lte: new Date(req.query.dueDate) };
    }

    const sortOptions = {};
    if (req.query.sortBy) {
        sortOptions[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    }

    const { page, pageSize } = getPaginationParams(req);

    Task.paginate(filters, { page, limit: pageSize, sort: sortOptions })
        .then(result => {
            res.status(200).json({
                page: result.page,
                pageSize: result.limit,
                totalItems: result.docs.length,
                data: result.docs
            });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    return { page, pageSize };
}

/** STATISTICS **/
export function getTotalTaskCount(req, res) {
    totalTaskCount()
        .then(totalTaskCount => {
            res.status(200).json({ totalTaskCount });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}
export function getTaskCountByStatus(req, res) {
    const status = req.params.status;
    Task.countDocuments({ status })
        .then(count => {
            return totalTaskCount()
                .then(totalCount => {
                    const percentage = calculatePercentage(count, totalCount);
                    res.status(200).json({
                        [`${status} Tasks`]: {
                            count,
                            percentage,
                        },
                    });
                });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

export function getTaskCountByPriority(req, res) {
    const priority = req.params.priority;
    Task.countDocuments({ priority })
        .then(count => {
            return totalTaskCount()
                .then(totalCount => {
                    const percentage = calculatePercentage(count, totalCount);
                    res.status(200).json({
                        [`${priority.toLowerCase()} priority Tasks`]: {
                            count,
                            percentage,
                        },
                    });
                });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

export function getTaskCountByCategory(req, res) {
    const category = req.params.category;
    Task.countDocuments({ category })
        .then(count => {
            return totalTaskCount()
                .then(totalCount => {
                    const percentage = calculatePercentage(count, totalCount);
                    res.status(200).json({
                        [`${category.toLowerCase()} category Tasks`]: {
                            count,
                            percentage,
                        },
                    });
                });
        })
        .catch(error => {
            res.status(500).send({ message: "Internal Server Error!" });
        });
}

export async function totalTaskCount() {
    try {
        const count = await Task.countDocuments();
        return count;
    } catch (error) {
        throw new Error("Unable to retrieve total task count");
    }
}

function calculatePercentage(count, total) {
    return total > 0 ? ((count / total) * 100).toFixed(2) : 0;
}
