const mongoose = require('mongoose'),
  Schema = mongoose.Schema;
 
let ToDoEvent = new Schema ({
    parentId:{
        type:String
    },        
    listId:{
        type:String
    },
    id:{
        type:String
    },
    userId:{
        type:String
    },
    name: {
        type:String
    },
    listName: {
        type:String
    },
    isDone: {
        type:Boolean,
        default:false
    },
    createdBy:{
        type:String
    },
    createdOn:{
        type:Date
    },
    events: { type: [] }
})

mongoose.model('ToDoEvent', ToDoEvent);

let ToDoList = new Schema ({
    id:{
        type:String
    },
    userId:{
        type:String
    },
    name: {
        type:String
    },
    createdBy:{
        type:String
    },
    createdOn:{
        
    },
    listName:{
        type:String
    },
    events: [{}]
})

mongoose.model('ToDoList', ToDoList);

let ToDoNode = new Schema ({
    parentId:{
        type:String
    },
    listId:{
        type:String
    },
    id:{
        type:String
    },
    userId:{
        type:String
    },
    name: {
        type:String
    },
    listName:{
        type:String
    },
    createdBy:{
        type:String
    },
    createdOn:{
        type:Date
    },
    isDone: {
        type:Boolean,
        default:false
    },
    actionName:{
        type:String 
    }
})

mongoose.model('ToDoNode', ToDoNode);

let undoDB = new Schema({
    actionName:{
        type:String
    },
    previousName: {
        type:String
    },
    parentId:{
        type:String
    },
    listId:{
        type:String
    },
    id:{
        type:String
    },
    userId:{
        type:String
    },
    listName:{
        type:String
    },
    createdBy:{
        type:String
    },
    createdOn:{
        type:Date
    },
    isDone: {
        type:Boolean,
        default:false
    },
    events: {
        type:Array
    }
})

mongoose.model('undoDB', undoDB);