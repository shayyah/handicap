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
    senderName:{
        type:String,
        required:false
    },
    conversation_id:{
      type:String,
      required:true
    },
    sound:{
      type:String,
      required:false
    },
    text:{
      type:String,
      required:false
    },
    nameSound:{
      type:String,
      required:false
    },
    date:{
      type:Date,
      required:false
    },
    appdate:{
      type:String,
      required:false
    }
});
var Message = module.exports = mongoose.model('Message', messageSchema);
module.exports.get = function (callback, limit) {
    Message.find(callback).limit(limit);
}
