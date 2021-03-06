var mongoose = require('mongoose');

var videoConversationSchema=mongoose.Schema({
    roomid:{
      type:String,
      required:true
    },
    userid:{
      type:String,
      required:true
    },
    volunteerid:{
      type:String,
      required:false
    },
    userName:{
      type:String,
      required:false
    },
    isDone:{
      type:String,
      required:false
    }
});
var VideoConversation = module.exports = mongoose.model('videoConversation', videoConversationSchema);
module.exports.get = function (callback, limit) {
    VideoConversation.find(callback).limit(limit);
}
