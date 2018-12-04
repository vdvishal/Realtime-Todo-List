const express = require('express');
const router = express.Router();
const toDoController = require("./../../app/controllers/toDoController.js");
const appConfig = require("./../../config/appConfig")

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/events`;

    app.post(`${baseUrl}/createlist`, toDoController.createToDoList);

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/createlist api to create a list.
     *
     * @apiParam {string} userId userId of the user. (body) (required)
     * @apiParam {string} name name of the list. (body) (required)
     * @apiParam {string} createdBy name of the user. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "list created",
            "status": 200,
            "data": {
                "__v": 0,
                "id": "yTEXxEQVb",
                "userId": "_nlTQ_WAg",
                "name": "ToDoList3",
                "createdBy": "MMMM",
                "createdOn": "2018-08-29T07:13:07Z",
                "_id": "5b864783f8a2cf00d8fd636e",
                "events": []
            }
        }
    */

    app.post(`${baseUrl}/deletelist/:id`, toDoController.deleteList);

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/deletelist/id api to delete a list.
     *
     * @apiParam {string} id id of the list. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
    "error": false,
    "message": "list deleted",
    "status": 200,
    "data": {
        "n": 1,
        "ok": 1
             }
        }
    */

    app.post(`${baseUrl}/createlist/addevent/:id`, toDoController.createToDoEvent);

     /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/createlist/addevent/listId api to create a event.
     *
     * @apiParam {string} listId id of the list. (params) (required)
     * @apiParam {string} listName name of the list. (body) (required)
     * @apiParam {string} userId userId of the user. (body) (required)
     * @apiParam {string} createdBy name of the user. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "event created",
    "status": 200,
    "data": {
        "_id": "5b864d76f8a2cf00d8fd636f",
        "id": "VtnZCdfWn",
        "userId": "_nlTQ_WAg",
        "name": "ToDoList3",
        "createdBy": "MMMM",
        "createdOn": "2018-08-29T07:38:30Z",
        "__v": 0,
        "events": [
            {
                "isDone": false,
                "events": [],
                "_id": "5b864db8f8a2cf00d8fd6370",
                "createdOn": "2018-08-29T07:39:36.000Z",
                "id": "fflMTBGHN",
                "parentId": "VtnZCdfWn",
                "listId": "VtnZCdfWn",
                "__v": 0
            }
        ]
    }
}
    */

    app.get(`${baseUrl}/lists/:userId`, toDoController.getAllList);

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {get} /api/v1/events/lists/userId api to get all list of user.
     *
     * @apiParam {string} userId userId of the user. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "list available",
    "status": 200,
    "data": [
        {
            "_id": "5b858b407a26cb1da834debf",
            "id": "g53XKh9yt",
            "userId": "_nlTQ_WAg",
            "name": "qweqwe",
            "createdBy": "Vishal",
            "__v": 1,
            "events": [
                {
                    "isDone": false,
                    "events": [],
                    "_id": "5b85a4676f4e6f2bc40b6267",
                    "createdBy": "Vishal",
                    "listName": "qweqwe",
                    "name": "asdasd",
                    "userId": "_nlTQ_WAg",
                    "id": "ckuOUq507",
                    "parentId": "g53XKh9yt",
                    "listId": "g53XKh9yt",
                    "__v": 0
                }
            ]
        },...
    */


    app.get(`${baseUrl}/list/:id`, toDoController.getList)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {get} /api/v1/events/list/id api to get list details.
     *
     * @apiParam {string} id id of the list. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "list available",
    "status": 200,
    "data": {
        "_id": "5b858b407a26cb1da834debf",
        "id": "g53XKh9yt",
        "userId": "_nlTQ_WAg",
        "name": "qweqwe",
        "createdBy": "Vishal",
        "__v": 1,
        "events": [
            {
                "isDone": false,
                "events": [],
                "_id": "5b85a4676f4e6f2bc40b6267",
                "createdBy": "Vishal",
                "listName": "qweqwe",
                "name": "asdasd",
                "userId": "_nlTQ_WAg",
                "id": "ckuOUq507",
                "parentId": "g53XKh9yt",
                "listId": "g53XKh9yt",
                "__v": 0
            }
        ]
    }
}
    */

    app.get(`${baseUrl}/subevent/:id`, toDoController.getSubEvent);

        /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {get} /api/v1/events/subevent/id api to get sub event details.
     *
     * @apiParam {string} id id of the parent event. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "event available",
    "status": 200,
    "data": [
        {
            "_id": "5b859d1ae2ac3308b025ddfc",
            "listId": "g53XKh9yt",
            "parentId": "ckuOUq507",
            "id": "ppWbE_Bwq",
            "userId": "_nlTQ_WAg",
            "name": "asdasd",
            "listName": "qweqwe",
            "createdBy": "Vishal",
            "createdOn": "2018-08-28T19:06:02.000Z",
            "__v": 0,
            "isDone": false
        },
    */

    app.post(`${baseUrl}/addevent/subevent/:id`,toDoController.subEvent)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/addevent/subevent/id api to add sub event .
     *
     * @apiParam {string} id id of the parent event. (params) (required)
     * @apiParam {string} name name of the subevent. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "event created",
    "status": 200,
    "data": {
        "__v": 0,
        "parentId": "ckuOUq507",
        "id": "lP8juodeA",
        "userId": "_nlTQ_WAg",
        "name": "ToDoList3",
        "createdBy": "MMMM",
        "createdOn": "2018-08-29T08:32:07.000Z",
        "_id": "5b865a07f8a2cf00d8fd6371",
        "isDone": false
    }
}
    */


    app.post(`${baseUrl}/delete/event/:id`,toDoController.deleteEvent)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/delete/event/id api to delete a event.
     *
     * @apiParam {string} id id of the list. (params) (required)
     * @apiParam {string} eventId id of the event. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
    "error": false,
    "message": "event deleted",
    "status": 200,
    "data": {
        "n": 1,
        "ok": 1
             }
        }
    */
    
    app.post(`${baseUrl}/delete/subevent/:id`,toDoController.deleteSubEvent)

/**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/delete/subevent/id api to delete a event.
     *
     * @apiParam {string} id id of the subevent. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
    "error": false,
    "message": "event deleted",
    "status": 200,
    "data": {
        "n": 1,
        "ok": 1
             }
        }
    */

    app.post(`${baseUrl}/edit/event/:id`,toDoController.editEvent)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/edit/event/id api to edit a event.
     *
     * @apiParam {string} id id of the list. (params) (required)
     * @apiParam {string} eventId id of the event. (body) (required)
     * @apiParam {string} name new name of the event. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "event edited",
    "status": 200,
    "data": {
        "_id": "5b858b407a26cb1da834debf",
        "id": "g53XKh9yt",
        "userId": "_nlTQ_WAg",
        "name": "qweqwe",
        "createdBy": "Vishal",
        "__v": 1,
        "events": [
            {
                "isDone": false,
                "events": [],
                "_id": "5b85a4676f4e6f2bc40b6267",
                "createdBy": "Vishal",
                "listName": "qweqwe",
                "name": "asdasd",
                "userId": "_nlTQ_WAg",
                "id": "ckuOUq507",
                "parentId": "g53XKh9yt",
                "listId": "g53XKh9yt",
                "__v": 0
            }
        ]
    }
}
    */


    app.post(`${baseUrl}/edit/subevent/:id`,toDoController.editSubEvent)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/edit/subevent/id api to edit a subevent.
     *
     * @apiParam {string} id id of the subevent. (params) (required)
     * @apiParam {string} name new name of the subevent. (body) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
    {
    "error": false,
    "message": "event edited",
    "status": 200,
    "data": {
        "n": 1,
        "nModified": 1,
        "ok": 1
            }
    }
    */

    app.post(`${baseUrl}/check/event/:id`,toDoController.checkEvent)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/check/event/id api to mark a event is completed.
     *
     * @apiParam {string} id id of the list. (params) (required)
     * @apiParam {string} eventId id of the event. (body) (required)
     * 
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
{
    "error": false,
    "message": "event checked",
    "status": 200,
    "data": {
        "_id": "5b858b407a26cb1da834debf",
        "id": "g53XKh9yt",
        "userId": "_nlTQ_WAg",
        "name": "qweqwe",
        "createdBy": "Vishal",
        "__v": 1,
        "events": [
            {
                "isDone": false,
                "events": [],
                "_id": "5b85a4676f4e6f2bc40b6267",
                "createdBy": "Vishal",
                "listName": "qweqwe",
                "name": "asdasd",
                "userId": "_nlTQ_WAg",
                "id": "ckuOUq507",
                "parentId": "g53XKh9yt",
                "listId": "g53XKh9yt",
                "__v": 0
            }
        ]
    }
}
    */

    app.post(`${baseUrl}/check/subevent/:id`,toDoController.checkSubEvent)

     /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/check/subevent/id api to mark a subevent is completed.
     *
     * @apiParam {string} id id of the subevent. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
    {
    "error": false,
    "message": "event checked",
    "status": 200,
    "data": {
        "n": 1,
        "nModified": 1,
        "ok": 1
            }
    }
    */


    app.post(`${baseUrl}/undo/:userId`,toDoController.undoAction)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/undo/userId api to save history.
     *
     * @apiParam {string} actionName actionName takes input: 'editevent','editSubevent','deleteEvent','deleteSubEvent','deleteList'
     * @apiParam {string} listId listId of list/event/sub-event. (body)
     * @apiParam {string} parentId parentId of event/sub-event. (body)
     * @apiParam {string} id id of list/event/sub-event. (body)
     * @apiParam {string} userId Id of user. (params)
     * @apiParam {string} previousName name of event. (body)
     * @apiParam {string} listName name of list. (body)
     * @apiParam {string} isDone status of event/subevent. (body)
     * @apiParam {string} createdBy creator of list/event/subevent. (body)
     * @apiParam {string} createdOn date of creation of list/event/subevent. (body)
     * @apiParam {string} events subevents of list/event if available. (body)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
    {
    "error": false,
    "message": "database saved",
    "status": 200,
    "data": {
        "n": 1,
        "ok": 1
            }
    }
    */

    app.post(`${baseUrl}/undodb/:userId`,toDoController.execUndo)

    /**
     * @apiGroup ToDo List
     * @apiVersion  1.0.0
     * @api {post} /api/v1/events/undodb/userId api to undo last event.
     *
     * @apiParam {string} userId id of the user. (params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
    {
    "error": false,
    "message": "action restored",
    "status": 200,
    "data": 
{
    "error": false,
    "message": "Action restored",
    "status": 200,
    "data": {
        "actionName": String,
        "parentId": String;
        "name": String
        "userId": String
        "listName": String
        "isDone": Boolean
        "createdBy": String
        "createdOn": Date
        "listId": String
    }
}
    
    */


}