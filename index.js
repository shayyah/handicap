const http = require('http');


var app=require('express')();
var server = require('http').Server(app);
const port=process.env.PORT || 3000
server = http.createServer((req, res) => {
res.statusCode = 200;
res.setHeader('Content-Type', 'text/html');
res.end('<h1>Hello Salim shebli and aliii habieb and shayah</h1>');
});
server.listen(port,() => {
console.log(`Server running at port `+port);
});

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
const fs = require('fs')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
var shortid=require('short-id');
// parse application/json
app.use(bodyParser.json())
var url = "mongodb://localhost:27017/";
app.get('/', function (req, res) {
  res.send('saliiiim"/"');
});
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) return;
  var path='C:/Users/salim-s/Desktop/Almacfufin/sounds/';
  console.log("server works");
  var dbo = db.db("makfufdb");
      app.post('/register',(req,res)=>{
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
      });
      app.get('/login',(req,res)=>{
        console.log(req.query.phone+'   '+req.query.password);
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
      });
      app.post('/addlocation',(req,res)=>{
      //  console.log(req.body.longitude);
        var longitude=req.body.longitude;
        var latitude=req.body.latitude;
        var address=req.body.address;
        CreateLocationAndAddToDataBase(longitude,latitude,address,function(myLocation){
          if(myLocation!=null)
          {
            res.json(myLocation);
          }
          else res.send('error');
        });
      });
      app.post('/test',(req,res)=>{
          fs.writeFile(path+'testsalim.txt',req.body.sound,(err)=>{
                if(err)console.log(err);
                res.send('done');
          });
      });
      app.post('/getLocations',(req,res)=>{
          var UserId=req.body.id;
          var LocationIds=req.body.locationIds;
          var UserLocation=req.body.userlocation;
          getUser(UserId,function(MyUser){
              if(MyUser!=null)
              {
                  GetLocationByUserLocation(UserLocation,function(locations){

                  });
              }
          });

      });
      app.get('/changelocationstate',(req,res)=>{
          var id=req.query.id;
          var state=req.query.state;
            console.log(state);
          if(state==true)
          {

              ApproveLocation(id,function(location){
                if(location!=null)
                {
                  res.json(location);
                }
                else {
                  res.send('error');
                }
              });
          }
          else {
              DeleteLocation(id,function(location){
                if(location!=null)
                {
                  res.json(location);
                }
                else {
                  res.send('error');
                }
              });
          }
      });
    function CreateUserAndAddToDataBase(rusername,ruserphone,ruserpassword,rsound,rdate,callback)
    {
      var User={
          id:shortid.generate(),
        name:rusername,
        phone:ruserphone,

        password:ruserpassword,
        sound:"",
        datemodified:rdate
      };
    //  console.log(JSON.stringify(User));
      fs.writeFile(path+User.id,rsound,(err)=>{
        if(err)callback(null);
        User.sound=path+User.id;
        dbo.collection('users').insertOne(User,function(err,res){
          if(err)callback(null);
          console.log('user inserted   '+JSON.stringify(User));
          callback(User);
        });
      });
    }
    function getUser(id,callback) {
        var query={id:id};
        dbo.collection('users').findOne(query,function(err,res){
            if(err)callback(null);
            callback(res);
        });
    }
    function DeleteLocation(locationid,callback)
    {
          GetLocationById(locationid,function(location){
                if(location!=null)
                {
                  dbo.collection('deletedlocations').insertOne(location,function(err,res){
                      if(err)callback(null);
                      var query={id:locationid};
                      dbo.collection('locations').deleteOne(query,function(err){
                            if(err)callback(null);

                            callback(location);
                      });

                    });

                }
                else callback(null);
          });
    }
    function ApproveLocation(locationid,callback)
    {
      GetLocationById(locationid,function(location){
          if(location!=null)
          {
            location.approved=true;
              var query={id:locationid};
              var value={$set: {approved:true}}
              dbo.collection('locations').updateOne(query,value,function(err){
                if(err)callback(null);
                callback(location);
              });
          }
          else callback(null);
      });
    }
    function CreateLocationAndAddToDataBase(rlongitude,rlatitude,raddress,callback)
    {

      var Location={
        id:shortid.generate(),
        longitude:rlongitude,
        latitude:rlatitude,
        address:'',
        approved:false
      };
      fs.writeFile(path+Location.id,raddress,(err)=>{
        if(err)callback(null);
        Location.address=path+Location.id;
        dbo.collection('locations').insertOne(Location,function(err,res){
            if(err)callback(null);
            console.log('location inserted   '+JSON.stringify(Location));
            callback(Location);
          });
      });
    }
    function GetLocationById(id,callback)
    {
      var query ={id:id};
      dbo.collection('locations').findOne(query,function(err,result){
          if(err)return callback(null);
          callback(result);
      });
    }
    function GetLocationByUserLocation(myLocation,callback)
    {
      var query ={'longitude':{$gt:myLocation.longitude-0.1,$lt:myLocation.longitude+0.1},
              'latitude':{$gt:myLocation.latitude-0.1,$lt:myLocation.latitude+0.1}};
      dbo.collection('locations').find(query).toArray(function(err,result){
          if(err)return callback(null);
          callback(result);
      });
    }
    function GetAllLocations(callback)
    {
        dbo.collection('locations').find({}).toArray(function(err,result){
            if(err)return callback(null);
            callback(result);
        });
    }
    function GetUserByPhone(Userphone,callback)
    {
      var query={phone:Userphone};
      dbo.collection('users').findOne(query,function(err,result){
          if(err)callback(null);
          console.log(result);
          callback(result);
      });
    }
});
