var mongoose=require('mongoose');
var conversationSchema=mongoose.Schema({
    id:{
        type:String,
          required:true
    },
    creator_id:{
        type:String,
        required:true
    },
    other_id:{
      type:String,
        required:true
    },
    date_created:{
      type:String,
      required:false
    }
});
var Conversation =module.exports=mongoose.model('Concersation',conversationSchema);
module.exports.get = function (callback, limit) {
    Conversation.find(callback).limit(limit);
}
