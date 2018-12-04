const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')
const redis = require("./../libs/redis.js")
const ToDo = require('./../models/ToDo.js')

const ToDoNode = mongoose.model('ToDoNode')
const ToDoEvent = mongoose.model('ToDoEvent')
const ToDoList = mongoose.model('ToDoList')
const undoDB = mongoose.model('undoDB')

let createToDoList = (req, res) => {
    let list = new ToDoList({
        id: shortid.generate(),
        userId: req.body.userId,
        name: req.body.name,
        createdBy: req.body.createdBy,
        createdOn: time.now()
    })

    list.save((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: createToDolist', 10)
            let apiResponse = response.generate(true, 'Failed to create new list', 500, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: createToDoEvent', 10)
            let apiResponse = response.generate(false, 'list created', 200, result)
            res.send(apiResponse);
        }
    })
}


let createToDoEvent = (req, res) => {
    let event = new ToDoEvent({
        listId: req.params.id,
        parentId: req.params.id,
        id: shortid.generate(),
        userId: req.body.userId,
        name: req.body.name,
        listName: req.body.listName,
        isDone: req.body.isDone,
        createdBy: req.body.userName,
        createdOn: time.now()
    })

    event.save((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: createToDoEvent', 10)
            let apiResponse = response.generate(true, 'Failed to create new event', 500, null)
            reject(apiResponse)
        }
        else {
            ToDoList.findOneAndUpdate({ "id": req.params.id }, { "$push": { events: result } }, { "new": true })
                .exec((err, resp) => {
                    if (err) {
                        logger.error(err.message, 'toDoController: createToDoEvent', 10)
                        let apiResponse = response.generate(true, 'Failed to create new event', 500, null)
                        res.send(apiResponse)
                    }
                    else {
                        logger.info(null, 'toDoController: createToDoEvent', 10)
                        let apiResponse = response.generate(false, 'event created', 200, resp)
                        res.send(apiResponse);
                    }
                })
        }
    })
}

let subEvent = (req, res) => {

    let event = new ToDoNode({
        listId: req.body.listId,
        parentId: req.params.id,
        id: shortid.generate(),
        userId: req.body.userId,
        name: req.body.name,
        listName: req.body.listName,
        isDone: req.body.isDone,
        createdBy: req.body.createdBy,
        createdOn: time.now()
    })

    event.save((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: subEvent', 10)
            let apiResponse = response.generate(true, 'Failed to create new list', 500, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: subEvent', 10)
            let apiResponse = response.generate(false, 'event created', 200, result)
            res.send(apiResponse);
        }
    })
}

let getAllList = (req, res) => {
    ToDoList.find({ userId: req.params.userId })
        .sort({ createdOn: 'descending' })
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'toDoController: getAlllist', 10)
                let apiResponse = response.generate(true, 'Failed to get list', 500, null)
                res.send(apiResponse)
            }
            else if (check.isEmpty(result)) {
                let apiResponse = response.generate(false, 'list empty', 404, null)
                res.send(apiResponse);
            }
            else {
                logger.info(null, 'toDoController: getalllist', 10)
                let apiResponse = response.generate(false, 'list available', 200, result)
                res.send(apiResponse);
            }
        })

}

let getList = (req, res) => {
    ToDoList.findOne({ id: req.params.id })
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'toDoController: getlist', 10)
                let apiResponse = response.generate(true, 'Failed to get list', 500, null)
                res.send(apiResponse)
            } else if (result === null) {
                let apiResponse = response.generate(true, 'No list', 404, null)
                res.send(apiResponse)
            }
            else {
                logger.info(null, 'toDoController: getlist', 10)
                let apiResponse = response.generate(false, 'list available', 200, result)
                res.send(apiResponse);
            }
        })
}

let deleteList = (req, res) => {
    // ToDoList.remove({userId: 'MKN2E7qW5'}).exec()
    // undoDB.remove({userId: 'MKN2E7qW5'}).exec()
    ToDoList.remove({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: deleteList', 10)
            let apiResponse = response.generate(true, 'Failed to delete List', 500, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: deletelist', 10)
            let apiResponse = response.generate(false, 'list deleted', 200, result)
            res.send(apiResponse);
        }
    })
}


let getSubEvent = (req, res) => {
    ToDoNode.find({ parentId: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: deleteList', 10)
            let apiResponse = response.generate(true, 'Failed to find subevent', 500, null)
            res.send(apiResponse)
        }
        else if (check.isEmpty(result)) {
            logger.info(null, 'toDoController: getalllist', 10)
            let apiResponse = response.generate(false, 'No sub events', 404, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: getalllist', 10)
            let apiResponse = response.generate(false, 'event available', 200, result)
            res.send(apiResponse);
        }
    })
}

let deleteEvent = (req, res) => {
    ToDoList.findOne({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: deleteEvent', 10)
            let apiResponse = response.generate(true, 'Failed to delete event', 500, null)
            res.send(apiResponse)
        }
        else {
            result.events.forEach(event => {
                if (event.id === req.body.eventId) {
                    let index = result.events.indexOf(event);
                    result.events.splice(index, 1)
                    result.save((err, rest) => {
                        if (err) {
                            logger.error(err.message, 'toDoController: deleteEvent', 10)
                            let apiResponse = response.generate(true, 'Failed to delete event', 500, null)
                            res.send(apiResponse)
                        }
                        else {
                            logger.info(null, 'toDoController: deleteEvent', 10)
                            let apiResponse = response.generate(false, 'event deleted', 200, rest)
                            res.send(apiResponse);
                        }
                    })
                }
            });
        }
    })
}

let deleteSubEvent = (req, res) => {
    ToDoNode.remove({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: deleteSubEvent', 10)
            let apiResponse = response.generate(true, 'Failed to delete subevent', 500, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: deleteSubEvent', 10)
            let apiResponse = response.generate(false, 'event deleted', 200, result)
            res.send(apiResponse);
        }
    })
}

let editEvent = (req, res) => {
    ToDoList.findOne({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: editEvent', 10)
            let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
            res.send(apiResponse)
        }
        else {
            result.events.forEach(event => {
                if (event.id === req.body.eventId) {
                    let index = result.events.indexOf(event);
                    event.name = req.body.name
                    result.markModified('events');
                }
            });
            result.save((err, rest) => {
                if (err) {
                    logger.error(err.message, 'toDoController: editEvent', 10)
                    let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info(null, 'toDoController: editEvent', 10)
                    let apiResponse = response.generate(false, 'event edited', 200, rest)
                    res.send(apiResponse);
                }
            })
        }
    })
}

let editSubEvent = (req, res) => {
    ToDoNode.update({ id: req.params.id }, { name: req.body.name }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: editSubEvent', 10)
            let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
            res.send(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: editSubEvent', 10)
            let apiResponse = response.generate(false, 'event edited', 200, result)
            res.send(apiResponse);
        }

    })
}

let checkEvent = (req, res) => {
    ToDoList.findOne({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: checkEvent', 10)
            let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
            res.send(apiResponse)
        }
        else {
            result.events.forEach(event => {
                if (event.id === req.body.eventId) {
                    let index = result.events.indexOf(event);
                    event.isDone = !result.events[index].isDone
                    result.markModified('events');
                }
            });
            result.save((err, rest) => {
                if (err) {
                    logger.error(err.message, 'toDoController: checkEvent', 10)
                    let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info(null, 'toDoController: checkEvent', 10)
                    let apiResponse = response.generate(false, 'event checked', 200, rest)
                    res.send(apiResponse);
                }
            })
        }
    })
}

let checkSubEvent = (req, res) => {
    ToDoNode.findOne({ id: req.params.id }).exec((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController: checkSubEvent', 10)
            let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
            res.send(apiResponse)
        }
        else {
            result.isDone = !result.isDone
            result.markModified('result.isDone');
            result.save((err, rest) => {
                if (err) {
                    logger.error(err.message, 'toDoController: checkSubEvent', 10)
                    let apiResponse = response.generate(true, 'Failed to edit event', 500, null)
                    res.send(apiResponse)
                }
                else {
                    logger.info(null, 'toDoController: editEvent', 10)
                    let apiResponse = response.generate(false, 'event checked', 200, rest)
                    res.send(apiResponse);
                }
            })
        }
    })
}

let undoAction = (req, res) => {
    let event = new undoDB({
        actionName: req.body.actionName,
        listId: req.body.listId,
        parentId: req.body.parentId,
        id: req.body.eventId,
        userId: req.params.userId,
        previousName: req.body.previousName,
        listName: req.body.listName,
        isDone: req.body.isDone,
        createdBy: req.body.createdBy,
        created: req.body.createdOn,
        createdOn: time.now(),
        events: req.body.events
    })
    event.save((err, result) => {
        if (err) {
            logger.error(err.message, 'toDoController:undoAction', 10)
            let apiResponse = response.generate(true, 'Failed to create undo db', 500, null)
            reject(apiResponse)
        }
        else {
            logger.info(null, 'toDoController: undoAction', 10)
            let apiResponse = response.generate(false, '"database saved', 200, result)
            res.send(apiResponse);
        }
    })
}

let execUndo = (req, res) => {
    undoDB.find({ userId: req.params.userId })
        .sort({ createdOn: 'descending' })
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'toDoController: execUndo', 10)
                let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                reject(apiResponse)
            }
            else if (check.isEmpty(result)) {
                logger.info(null, 'toDoController: execUndo', 10)
                let apiResponse = response.generate(true, 'No undo action left',404, null)
                res.send(apiResponse)
            }
            else {
                if (result[0].actionName === 'editevent') {
                    ToDoList.findOne({ id: result[0].listId })
                        .exec((err, eventRes) => {
                            if (err) {
                                logger.error(err.message, 'toDoController: execUndo', 10)
                                let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                eventRes.events.forEach(event => {
                                    if (event.id === result[0].id) {
                                        let index = eventRes.events.indexOf(event);
                                        event.name = result[0].previousName
                                        eventRes.actionName = result[0].actionName
                                        eventRes.markModified('events');
                                    }
                                });
                                eventRes.save((err, rest) => {
                                    if (err) {
                                        logger.error(err.message, 'toDoController: execUndo', 10)
                                        let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                                        reject(apiResponse)
                                    }
                                    else {
                                        undoDB.remove({ _id: result[0]._id }).exec()
                                        logger.info(null, 'toDoController: execUndo', 10)
                                        let apiResponse = response.generate(false, 'event restored', 200, rest)
                                        res.send(apiResponse);

                                    }
                                })
                            }
                        })
                }
                else if (result[0].actionName === 'editSubevent') {
                    ToDoNode.update({ id: result[0].id }, { name: result[0].previousName })
                        .lean()
                        .exec((err, respon) => {
                            if (err) {
                                logger.error(err.message, 'toDoController: execUndo', 10)
                                let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                                reject(apiResponse)
                            }
                            else {
                                respon.actionName = result[0].actionName
                                respon.parentId = result[0].parentId
                                undoDB.remove({ _id: result[0]._id }).exec()
                                logger.info(null, 'toDoController:  execUndo', 10)
                                let apiResponse = response.generate(false, 'event edited', 200, respon)
                                res.send(apiResponse);
                            }

                        })
                }
                else if (result[0].actionName === 'deleteEvent') {
                    let event = new ToDoEvent({
                        listId: result[0].listId,
                        parentId: result[0].parentId,
                        id: result[0].id,
                        userId: result[0].userId,
                        name: result[0].previousName,
                        listName: result[0].listName,
                        isDone: result[0].isDone,
                        createdBy: result[0].createdBy,
                        createdOn: result[0].created
                    })
                    event.save((err, respon) => {
                        if (err) {
                            logger.error(err.message, 'toDoController:  execUndo', 10)
                            let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            ToDoList.findOneAndUpdate({ "id": result[0].listId }, { "$push": { events: respon } }, { "new": true })
                                .exec((err, resp) => {
                                    if (err) {
                                        logger.error(err.message, 'toDoController:  execUndo', 10)
                                        let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                                        reject(apiResponse)
                                    }
                                    else {
                                        undoDB.remove({ _id: result[0]._id }).exec()
                                        logger.info(null, 'toDoController: execUndo', 10)
                                        let apiResponse = response.generate(false, 'event restored', 200, resp)
                                        res.send(apiResponse);
                                    }
                                })
                        }
                    })
                }
                else if (result[0].actionName === 'deleteSubEvent') {
                    let event = new ToDoNode({
                        listId: result[0].listId,
                        parentId: result[0].parentId,
                        id: result[0].id,
                        userId: result[0].userId,
                        name: result[0].previousName,
                        listName: result[0].listName,
                        isDone: result[0].isDone,
                        createdBy: result[0].createdBy,
                        createdOn: result[0].created,
                        actionName: result[0].actionName
                    })
                    event.save((err, respon) => {
                        if (err) {
                            logger.error(err.message, 'toDoController:  execUndo', 10)
                            let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            undoDB.remove({ _id: result[0]._id }).exec()
                            logger.info(null, 'toDoController: execUndo', 10)
                            let apiResponse = response.generate(false, 'event restored', 200, respon)
                            res.send(apiResponse);
                        }
                    })
                }
                else if (result[0].actionName === 'deleteList') {
                    let list = new ToDoList({
                        id: result[0].id,
                        userId: result[0].userId,
                        name: result[0].previousName,
                        createdBy: result[0].createdBy,
                        createdOn: result[0].created,
                        events: result[0].events
                    })

                    list.save((err, respon) => {
                        if (err) {
                            logger.error(err.message, 'toDoController:  execUndo', 10)
                            let apiResponse = response.generate(true, 'Failed while exec', 500, null)
                            reject(apiResponse)
                        }
                        else {
                            undoDB.remove({ _id: result[0]._id }).exec()
                            logger.info(null, 'toDoController: execUndo', 10)
                            let apiResponse = response.generate(false, 'list restored', 200, respon)
                            res.send(apiResponse);
                        }
                    })
                }
            }
        })
}



module.exports = {
    createToDoList: createToDoList,
    createToDoEvent: createToDoEvent,
    getAllList: getAllList,
    subEvent: subEvent,
    deleteList: deleteList,
    getList: getList,
    getSubEvent: getSubEvent,
    deleteEvent: deleteEvent,
    deleteSubEvent: deleteSubEvent,
    editEvent: editEvent,
    editSubEvent: editSubEvent,
    checkEvent: checkEvent,
    checkSubEvent: checkSubEvent,
    undoAction: undoAction,
    execUndo: execUndo
}



