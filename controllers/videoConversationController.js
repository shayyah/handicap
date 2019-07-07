
var UserController =require('../controllers/userController');
var VideoConversation = require('../models/videoConversationModel.js');


exports.addnewroom=function(req,res){
    console.log('add new room');
      var id=req.body.roomid;
      var userid=req.body.userid;


      getRoom(id,function(room){

        if(room==null){
      UserController.getUser(userid,function(user){
        console.log(user);
        if(user!=null&&user.role==UserRole.Blind)
        {
              UserController.getAllVolunteers(function(volunteers){
                if(volunteers!=null){
                CreateVideoConversation(id,userid,function(conversation){
                    res.json(conversation);

                    sendnotification(conversation,user,volunteers);
                    closeRoomAfterTime(id);
                });
                }
                else {
                    res.json({message:'error'});
                }
              });

        }
        else {
            res.json({message:'error'});
        }
        });
      }
      else{
        res.json({message:'error'});
      }
    });
  }
  exports.answercall=function(req,res){
    var volunteerid=req.body.volunteerid;
    var roomid= req.body.roomid;
  //  var action=req.body.action;
    UserController.getUser(volunteerid,function(volunteer){

        if(volunteer!=null&&volunteer.role!=null&&volunteer.role==UserRole.Volunteer)
        {
            getRoom(roomid,function(room){
              console.log(room);
                if(room!=null&&room.isDone=='')
                {

                    room.isDone='yes';
                    room.volunteerid=volunteerid;
                    room.save(function(err){
                      if(err){
                        res.json({message:'error'});
                      }
                      else{
                        res.json({message:'done'});
                      }
                    });

                }
                else {
                    res.json({message:'error'});
                }
            });
        }
        else {
            res.json({message:'error'});
        }
    });
  }
  exports.getAllUnansweredCall=function(req,res){
    var volunteerid=req.query.id;
    UserController.getUser(volunteerid,function(volunteer){
        if(volunteer!=null&&volunteer.role==UserRole.Volunteer)
        {
            getUnansweredCall(function(calls){
              res.json({calls:calls});
            });
        }
        else{
            res.json({message:'error'});
        }
  });
}
  function getRoom(id,callback){
    VideoConversation.findOne({roomid:id},function(err,user){
        if(err)callback(null);
        callback(user);
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
  var time=1000*60*60;
await sleep(time);
console.log('reeeeeeturn');
  getRoom(id,function(room){
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
  function sendnotification(videoConversation,user,volunteers)
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
