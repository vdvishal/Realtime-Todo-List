const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let reqSchema = new Schema({
  recieverId: {
    type: String,
  },
  senderId: {
    type: String,
    default: '',
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  accept :{
    type:Boolean
  }
})


mongoose.model('Req', reqSchema);