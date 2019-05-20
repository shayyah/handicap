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
exports.login = function (req, res) {
  var phone=req.query.phone;
      var password=req.query.password;
      GetUserByPhone(phone,function(MyUser){
        if(MyUser!=null)
        {
            if(MyUser.password!=password)
              res.json({message:'wrong password or phone'});
            else {
              //MyUser.date=convertDate(MyUser.date);
              res.json(MyUser);
            }
        }
        else res.json({message:'error'});
      });

};
exports.register = function (req, res) {
  console.log('regggggggggg');
  var name=req.body.name;
      var phone=req.body.phone;
//      var token=req.body.token;
      var password=req.body.password;
      var sound=req.body.sound;
        var dateModified=new Date("2019-01-01T00:00:00.123Z");
      GetUserByPhone(phone,function(user){
        if(user==null)
        {
            CreateUserAndAddToDataBase(name,phone,password,sound,dateModified,function(myUser){
            if(myUser!=null)
              res.json(myUser);
            else res.json({message:'error'});
          });
        }
        else
        {
          res.json({message:'phone already exist'});
        }
      })

    //  console.log('name   '+ req.body.name);

  }
  exports.settoken=function(req,res){
    console.log('settoken');
      var id=req.body.id;
      var token=req.body.firebaseId;
      console.log(id+'    '+token);
      GetUser(id,function(user){
        if(user!=null)
        {
            setFirebaseToken(user,token,function(newUser) {
              console.log(JSON.stringify(newUser));
                if(newUser==null)
                    res.json({message:'error'});
                else res.json(newUser);
            });
        }
        else {
            res.json({message:'error'});
        }
      });

  }
function CreateUserAndAddToDataBase(rusername,ruserphone,ruserpassword,rsound,rdate,callback)
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
  exports.addunreadMessage=function(user,callback)
  {
  //  if(user.unreadMessages==null)user.unreadMessages=0;
    user.unreadMessages++;
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
  user.save(function(err){
      if(err)callback(null);
      else callback(user);
  });
}
exports.DisconnectSocket=function(user)
{
  user.online=false;
  user.lastOnline=new Date();
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
    message.nameSound=user.sound;
    message.text=text;
    message.senderId=user.id;
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
