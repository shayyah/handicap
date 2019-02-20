var mongoose = require('mongoose');

var messageSchema=mongoose.Schema({
    id:{
      type:String,
      required:true
    },
    senderId:{
      type:String,
      required:true
    },
    sound:{
      type:String,
      required:true
    },
    nameSound:{
      type:String,
      required:true
    },
    date:{
      type:Date,
      required:false
    },
});
var Message = module.exports = mongoose.model('Message', messageSchema);
module.exports.get = function (callback, limit) {
    Message.find(callback).limit(limit);
}