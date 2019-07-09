var shortid = require('short-id');
var fs=require('fs');

//var MongoClient = require('mongodb').MongoClient;
//var db_uri = 'mongodb://127.0.0.1:27017/blind_support_data';
//var db_params = { useNewUrlParser : true };
//var dbo;
//MongoClient.connect(db_uri, db_params,function(err,db){
//    dbo =db.db('blind_support_data');
//});
User = require('../models/userModel.js');
Message=require('../models/messageModel.js');
// Import short-id
var path="/app/sound/";
// Import fs
UserRole={
  Blind:'Blind',
  Volunteer:'Volunteer',
  Admin:'Admin'
};



exports.login = {
  handler:function (req, res) {
  console.log('login');
  var phone=req.query.phone;
      var password=req.query.password;
      GetUserByPhone(phone,function(MyUser){
        if(MyUser!=null)
        {
            if(MyUser.password!=password)
              res({message:'wrong password or phone'});
            else {
              //MyUser.date=convertDate(MyUser.date);
              res(MyUser);
            }
        }
        else res({message:'error'});
      });

}
};
exports.register = {
  handler:function (req, res) {
  console.log('regggggggggg');
  var name=req.payload.name;
      var phone=req.payload.phone;
      var role=req.payload.role;
//      var token=req.body.token;
      var password=req.payload.password;
      var sound=req.payload.sound;
        var dateModified=new Date("2019-01-01T00:00:00.123Z");
      GetUserByPhone(phone,function(user){
        if(user==null&&UserRole[role])
        {
            CreateUserAndAddToDataBase(name,phone,password,sound,dateModified,role,function(myUser){
            if(myUser!=null)
              res(myUser);
            else res({message:'error'});
          });
        }
        else
        {
          if(user!=null)
            res({message:'phone already exist'});
          else {
            res({message:'wrong role'});

          }
        }
      })

    //  console.log('name   '+ req.body.name);

  }
};
  exports.settoken={
    handler:function(req,res){
    console.log('settoken');
      var id=req.payload.id;
      var token=req.payload.firebaseId;
      console.log(id+'    '+token);
      GetUser(id,function(user){
        if(user!=null)
        {
            setFirebaseToken(user,token,function(newUser) {
              console.log(JSON.stringify(newUser));
                if(newUser==null)
                    res({message:'error'});
                else res(newUser);
            });
        }
        else {
            res({message:'error'});
        }
      });

  }
};
function CreateUserAndAddToDataBase(rusername,ruserphone,ruserpassword,rsound,rdate,rrole,callback)
    {
      var user=new User();
          user.id=shortid.generate();
          user.socketId="";
        user.name=rusername;
        user.phone=ruserphone;
        user.password=ruserpassword;
  //      user.sound="";
        user.datemodified=rdate;
        user.online=false;
        user.lastOnline=new Date();
        user.location_count=0;
        user.firebaseId='';
        user.unreadMessages=0;
        user.lastUnreadMessage='';
        user.role=rrole;
    //  console.log(JSON.stringify(User));
    //  fs.writeFile(path+user.id,rsound,(err)=>{
  //     if(err)callback(err);
        user.sound=rsound;//path+user.id;
        user.save(function(err){
          if(err)callback(err);
       console.log('user inserted   '+JSON.stringify(user));
          callback(user);
  //    });
     });
    }
  function setFirebaseToken(user,firebaseToken,callback)
  {
      user.firebaseId=firebaseToken;
      user.save(function(err){
        if(err)callback(err);
        callback(user);
      });
  }
  function GetUser(id,callback){
    User.findOne({id:id},function(err,user){
        if(err)callback(null);
        callback(user);
    });

  }
exports.getUser=function(id,callback) {
  console.log('getUser');
      User.findOne({id:id},function(err,user){
          if(err)callback(null);
          callback(user);
      });

  }
exports.getAllUsers=function(callback){
    User.find({},function(err,res){
        if(err)callback(null);
        callback(res);
    });
}
exports.UnreadMessages=function(user,conversationsId,callback){
    var messages=[];
    //{$in:conversationsIds}
      var query={'date':{$gt:user.lastOnline},'conversation_id':conversationsId};
      Message.find(query,function(err,res){
          if(err){
              console.log('error find messages');
          }
          else {
              callback(res);
          }
        });



};
exports.ModifyUserDate=  function(userId,date)
    {
      User.findOne({id:userId},function(err,user){
          if(err)console.log(err);
          if(user!=null){
            user.datemodified=date;
            user.save(function(err){
                if(err)console.log(err);
                console.log('user updated  '+user);
            });
          }
      });

    }
  exports.Updatelocation_count= function(user,value)
  {
      user.location_count+=value;
      user.save(function(err){
        if(err) console.log(err);
      });
  }
    function sortMessagesByDate(messages,callback)
    {
        var DateMessage={
          date:new Date(),
          messages:[]
        }
        var AllDateMessages=[];
        for(var i=0;i<messages.length;i++)
        {
            if(i!=0)
            {
                if(messages[i].date.getYear()!=messages[i-1].date.getYear()||messages[i].date.getMonth()!=messages[i-1].date.getMonth()||
                        messages[i].date.getDate()==messages[i-1].date.getDate())
                        {
                            AllDateMessages.push(DateMessage);
                            DateMessage.date=messages[i].date;
                            DateMessage.messages=[];
                            DateMessage.messages.push(messages[i]);
                        }
            }
            else{
              DateMessage.date=messages[i].date;
              DateMessage.messages.push(messages[i]);
            }
        }
        AllDateMessages.push(DateMessage);
        callback(AllDateMessages);

    }
  exports.addunreadMessage=function(user,conversationId,callback)
  {
   if(user.unreadMessages==null)user.unreadMessages=0;
    user.unreadMessages++;
    if(user.lastUnreadMessage!=null&&user.lastUnreadMessage!=''&&user.lastUnreadMessage!=conversationId)
    {
      user.lastUnreadMessage='-1';
    }
    else {
      user.lastUnreadMessage=conversationId;
    }
    user.save(function(err){
        if(err)callback(null)
        callback(user);
    });
  }
//Socket IO messenger
exports.LoginSocket=function(user,socketId,callback)
{
  user.online=true;
  user.socketId=socketId;

  user.unreadMessages=0;
  user.lastUnreadMessage='';
  user.save(function(err){
      if(err)callback(null);
      else callback(user);
  });
}
exports.DisconnectSocket=function(user)
{
  user.online=false;
    //console.log(user.lastOnline);

    var newdate=new Date( Date.now() - 2000 * 60 );
  //  console.log(dd);
  user.lastOnline=newdate;
  //console.log(user.lastOnline);
  user.save(function(err){
      if(err)console.log('error');
      else console.log('Disconnected');
  });
}
exports.CreateNewMessage=function(user,conversation_id,text,mSound,mDate,callback)
{
    var message=new Message();
    message.id=shortid.generate();
    message.conversation_id=conversation_id;
    message.sound=mSound;
    message.nameSound='';
    message.text=text;
    message.senderId=user.id;
    message.senderName=user.name;
    message.date=mDate;
    message.appdate=convertDate(mDate);
    console.log('mmmm  '+JSON.stringify(message));
    message.save(function(err){
      console.log(err);
      if(err)callback(null);
      else {
        console.log('message created');
        callback(message);
      }
    })
}
exports.getAllVolunteers=function(callback){
  var query={'role':UserRole.Volunteer};
  User.find(query,function(err,res){
    if(err)callback(null)
    callback(res);
  });
}
function convertDate(date)
{
  console.log(date+'   '+date.getMonth());
    var newDate=date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    console.log(newDate);
    return newDate;
}
function GetUserByPhone(Userphone,callback)
    {
      User.findOne({phone:Userphone},function(err,user){
          if(err)callback(null);
          callback(user);
      });
  //    var query={phone:Userphone};
  //    dbo.collection('users').findOne(query,function(err,result){
  //        if(err)callback(null);
  //        console.log(result);
  //        callback(result);

    }
  exports.getUserByPhone=function(Userphone,callback)
  {
    User.findOne({phone:Userphone},function(err,user){
        if(err)callback(null);
        callback(user);
    });
  }
