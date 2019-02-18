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
// Import short-id
var path="~/sound/";
// Import fs
exports.login = function (req, res) {
  var phone=req.query.phone;
      var password=req.query.password;
      GetUserByPhone(phone,function(MyUser){
        if(MyUser!=null)
        {
            if(MyUser.password!=password)
              res.send("wrong password or phone");
            else res.json(MyUser);
        }
        else res.send("error");
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
    //  console.log('name   '+ req.body.name);
      CreateUserAndAddToDataBase(name,phone,password,sound,dateModified,function(myUser){
        if(myUser!=null)
          res.json(myUser);
        else res.send('error');
      });
  }
function CreateUserAndAddToDataBase(rusername,ruserphone,ruserpassword,rsound,rdate,callback)
    {
      var user=new User();
          user.id=shortid.generate();
        user.name=rusername;
        user.phone=ruserphone;
        user.password=ruserpassword;
        user.sound="";
        user.datemodified=rdate;

    //  console.log(JSON.stringify(User));
      fs.writeFile(path+user.id,rsound,(err)=>{
        if(err)callback(err);
        user.sound=path+user.id;
        user.save(function(err){
          if(err)callback(err);
          console.log('user inserted   '+JSON.stringify(user));
          callback(user);
        });
      });
    }
exports.getUser=function(id,callback) {
  console.log('getUser');
      User.findOne({id:id},function(err,user){
          if(err)callback(null);
          callback(user);
      });

  }
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
