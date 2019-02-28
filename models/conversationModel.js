var mongoose=require('mongoose');
var conversationSchema=mongoose.Schema({
    id:{

    },
    creator_id:{
        type:String,
        require:true
    },
    other_id:{
      type:String,
      require:true
    },
    date_created:{
      type:String,
      require:false
    }
});
var Conversation =module.exports=mongoose.model('Concersation',conversationSchema);
module.exports.get = function (callback, limit) {
    Conversation.find(callback).limit(limit);
}
