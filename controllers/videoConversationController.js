
var UserController =require('../controllers/userController');
var VideoConversation = require('../models/videoConversationModel.js');


exports.addnewroom={
  handler:function(req,res){
    console.log('add new room');
      var id=req.payload.roomid;
      var userid=req.payload.userid;


      GetRoom(id,function(room){

        if(room==null){
      UserController.getUser(userid,function(user){
        console.log(user);
        if(user!=null&&user.role==UserRole.Blind)
        {

                CreateVideoConversation(id,userid,function(conversation){
                    res(conversation);

                  //  sendnotification(conversation,user,volunteers);
                    closeRoomAfterTime(id);
                });


        }
        else {
            res({message:'error'});
        }
        });
      }
      else{
        res({message:'error'});
      }
    });
  }
};
  exports.answercall={
    handler:function(req,res){
    var volunteerid=req.payload.volunteerid;
    var roomid= req.payload.roomid;
  //  var action=req.body.action;
    UserController.getUser(volunteerid,function(volunteer){

        if(volunteer!=null&&volunteer.role!=null&&volunteer.role==UserRole.Volunteer)
        {
            GetRoom(roomid,function(room){
              console.log(room);
                if(room!=null&&room.isDone=='')
                {

                    room.isDone='yes';
                    room.volunteerid=volunteerid;
                    room.save(function(err){
                      if(err){
                        res({message:'error'});
                      }
                      else{
                        res({message:'done'});
                      }
                    });

                }
                else {
                    res({message:'error'});
                }
            });
        }
        else {
            res({message:'error'});
        }
    });
  }
};

  exports.getAllUnansweredCall={
    handler:function(req,res){
    var volunteerid=req.query.id;
    UserController.getUser(volunteerid,function(volunteer){
      console.log('get all getUnansweredCall   '+volunteerid+'   '+volunteer);
        if(volunteer!=null&&volunteer.role==UserRole.Volunteer)
        {
            getUnansweredCall(function(calls){
              res({calls:calls});
            });
        }
        else{
            res({message:'error'});
        }
  });
}
};
  function GetRoom(id,callback){
    VideoConversation.findOne({roomid:id},function(err,user){
        if(err)callback(null);
        callback(user);
    });
  }
  exports.getRoom = function(id,callback){
    VideoConversation.findOne({roomid:id},function(err,user){
        if(err)callback(null);
        callback(user);
    });
  }
  exports.endCall=function(roomid,callback)
  {
    GetRoom(roomid,function(room){
          if(room!=null)
          {
              room.isDone='ended';
              room.save(function(err){
                  if(err)callback(null);
                  else callback(room);
              });
          }
          else {
            callback(null);
          }
      });
  }
  function getUnansweredCall(callback)
  {
    var query={'isDone':''};

  VideoConversation.find(query,function(err,result){
    if(err)callback(null);
    callback(result);
  });
}
async function closeRoomAfterTime(id)
{
  var time=1000*60*10;
await sleep(time);
console.log('reeeeeeturn');
  GetRoom(id,function(room){
      if(room!=null&&room.isDone=='')
      {
        room.isDone='no';
        room.save(function(err){
            if(err)console.log(err);
            else console.log('close room done');
        });
      }
  });
}

function sleep(ms){
return new Promise(resolve=>{
    setTimeout(resolve,ms)
});
}
  exports.sendnotification =function(videoConversation,user)
  {

    console.log('send notification');
    var mes= "You have new video call";
    var notification = {
      notification: {
        title: mes,
        body: "",
        click_action: "openapp",
        sound:"sound",
        tag:"videoConversation",
        collapse_key: "green"
      },
      data: {
        userId:user.id,
        userName:user.name,
        roomid:videoConversation.roomid,
      }
    };
    var options = {
      priority: "high"
    };
    UserController.getAllVolunteers(function(volunteers){
      if(volunteers!=null){
          volunteers.forEach(function(volunteer){
            var token=volunteer.firebaseId;

            //console.log('token   '+token);
            admin.messaging().sendToDevice(token, notification, options)
              .then(function(response) {
                console.log("Successfully sent message:", response);
              })
              .catch(function(error) {
                console.log("Error sending message:", error);
              });
          });
        }
      });
  }

  function CreateVideoConversation(vroomid,vuserid,callback)
  {
      var conv=new VideoConversation();
      conv.roomid=vroomid;
      conv.userid=vuserid;
      conv.advisorid='';
      conv.isDone='';
      conv.save(function(err){
        if(err)callback(err);
        console.log('conv  inserted   '+JSON.stringify(conv));
          callback(conv);
      });
  }
