var shortid = require('short-id');
var fs=require('fs');
Conversation =require('../models/conversationModel.js');
exports.createConversation=function(creator_id,other_id,callback){
    var date=new Date();
    findConversation(creator_id,other_id,function(conversation){
      if(conversation!=null){
        createConversation(creator_id,other_id,date,function(conversation){
            callback(conversation);
        });
      }
      else {
        callback(conversation);
      }
    })


}
exports.getConversatios=function(id,callback){
  Conversation.findOne({id:id},function(err,res){
      if(err)callback(null);
      else callback(res);
  });
}
function saveConversation(creator_id,other_id,date,callback){
  var conversation =new Conversation();
  conversation.id=shortid.generate();
  conversation.creator_id=creator_id;
  conversation.other_id=other_id;
  conversation.date=date;
  conversation.save((err)=>{
      if(err)callback(null);
      else callback(conversation);
  });

}
function findConversation(creator_id,other_id,callback){
  var query={'creator_id':creator_id,'other_id':other_id};
  var query2={'creator_id':other_id,'other_id':creator_id};
  conversation.findOne(query,function(err,result){
      if(result!=null)
      {
        callback(result);
      }
      else {
        conversation.findOne(query2,function(err2,result2){
          if(result2!=null)
          {
            callback(result2);
          }
          else {
              callback(null);

          }
        });
      }
  });
}
exports.getAllConversations= function(userId,callback){
  var query={$or:[{'creator_id':userId},{'other_id':userId}]};
  Conversation.find(query,function(err,res){
    if(err)callback(null);
    else callback(res);
  });
}
