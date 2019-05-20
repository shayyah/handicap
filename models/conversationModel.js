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
    creator_name:{
      type:String,
      required:false
    },
    other_name:{
      type:String,
      required:false
    },
    date_created:{
      type:String,
      required:false
    }
});
var Conversation =module.exports=mongoose.model('Conversation',conversationSchema);
module.exports.get = function (callback, limit) {
    Conversation.find(callback).limit(limit);
}
