var shortid = require('short-id');
var fs=require('fs');
Conversation =require('../models/conversationModel.js');
UserController =require('../controllers/userController');
exports.createConversation=function(creator_id,other_id,callback){
    var date=new Date();
    findConversation(creator_id,other_id,function(conversation){
      if(conversation!=null){
            callback(conversation);
      }
      else {
        UserController.getUser(creator_id,function(creator){
              UserController.getUser(other_id,function(other){
                  if(creator!=null&&other!=null){
                    saveConversation(creator,other,date,function(Newconversation){
                        callback(Newconversation);
                    });
                  }
                  else {
                    callback(null);
                  }
              });
        });

      }
    })


}
exports.getConversatios=function(id,callback){
  Conversation.findOne({id:id},function(err,res){
      if(err)callback(null);
      else callback(res);
  });
}
function saveConversation(creator,other,date,callback){
  var conversation =new Conversation();
  conversation.id=shortid.generate();
  conversation.creator_id=creator.id;
  conversation.other_id=other.id;
  conversation.creator_name=creator.name;
  conversation.other_name=other.name;
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
