var shortid = require('short-id');
var fs=require('fs');
Location = require('../models/locationModel.js');
var UserController =require('../controllers/userController');
//var dbo;
//var MongoClient = require('mongodb').MongoClient;
//var db_uri = 'mongodb://127.0.0.1:27017/blind_support_data';
//var db_params = { useNewUrlParser : true };
//MongoClient.connect(db_uri, db_params,function(err,db){
//    dbo =db.db('blind_support_data');
//});
var path="C:/Users/salim-s/Desktop/blind support/sound/"
exports.getlocations=function(req,res){
  var UserId=req.query.id;
        var UserLocation={
          longitude:req.query.longitude,
          latitude:req.query.latitude
        };
        console.log(UserId);
        UserController.getUser(UserId,function(MyUser){
      //    console.log(JSON.stringify(MyUser));
            if(MyUser!=null)
            {
    //          console.log('1');
                    GetLocationByUserLocation(UserLocation,MyUser,function(locations){
          //              console.log(locations.length);
                        if(locations!=null)
                        {
                            GetDeletedLocationsByDateModified(UserLocation,MyUser,function(deletedlocations){
                        //      console.log(deletedlocations.length);
                                if(deletedlocations!=null)
                                {
                                    UserController.ModifyUserDate(MyUser.id,new Date());
                                    res.json({locations:locations,deletedlocations:deletedlocations});

                                }
                                else {
                                  res.send('error');
                                }
                            });
                        }
                        else res.send('error');
                });
            }
            else res.send('error');
        });
};
exports.addlocation=function(req,res){

        var longitude=parseFloat(req.body.longitude);
        var latitude=parseFloat(req.body.latitude);
        var address=req.body.address;
        console.log(address);
        CreateLocationAndAddToDataBase(longitude,latitude,address,function(myLocation){
          if(myLocation!=null)
          {
            res.json(myLocation);
          }
          else res.send('error');
        });
};
exports.changestate=function(req,res){
  console.log("puuut");
          var id=req.body.id;
          var state=req.body.state;
            console.log(state);
          if(state=='true')
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
        };
exports.getnearbylocation=function(req,res){
  var id=req.query.id;
  var UserLocation={
    longitude:req.query.longitude,
    latitude:req.query.latitude
  };
  UserController.getUser(UserId,function(MyUser){
//    console.log(JSON.stringify(MyUser));
      if(MyUser!=null)
      {
          GetNearbyUnapprovedLocations(UserLocation,function(locations){
            if(locations!=null)
              res.json({nearbyLocations:locations});
            else res.send('error');
          });
      }
      else res.send('error');
    });
}
function GetAllLocations(callback)
    {
      Location.find({},function(err,result){
        if(err)callback(null);
        callback(result);
      });

    }
    function ApproveLocation(locationid,callback)
      {
        GetLocationById(locationid,function(location){
            if(location!=null)
            {
              location.approved=true;
              location.deleted=false;
              location.save(function(err){
                if(err)callback(null);
                callback(location);
              });
        //        var query={id:locationid};
        //        var value={$set: {approved:true}}
        //        dbo.collection('locations').updateOne(query,value,function(err){
        //          if(err)callback(null);
        //          callback(location);
        //        });
            }
            else callback(null);
        });
      }
      function CreateLocationAndAddToDataBase(rlongitude,rlatitude,raddress,callback)
      {
  //      console.log(JSON.stringify(UserController));
        var location=new Location();
          location.id=shortid.generate();
          location.longitude=rlongitude;
          location.latitude=rlatitude;
          location.address="";
          location.approved=false;
          location.deleted=false;
          location.datemodified=new Date();
        console.log(JSON.stringify(location));
        fs.writeFile(path+location.id,raddress,(err)=>{
          if(err)callback(null);
          location.address=path+location.id;
          location.save((err)=>{
              if(err)callback(null);
              callback(location);
          });
    //      dbo.collection('locations').insertOne(Location,function(err,res){
  //            if(err)callback(null);
    //          console.log('location inserted   '+JSON.stringify(Location));
    //          callback(Location);
    //        });
        });
      }
      function GetLocationById(id,callback)
      {
        Location.findOne({id:id},function(err,res){
          if(err)return callback(null);
          callback(res);
        });
    //    var query ={id:id};
    //    dbo.collection('locations').findOne(query,function(err,result){
  //          if(err)return callback(null);
  //          callback(result);
  //      });
      }
      function GetLocationByUserLocation(myLocation,user,callback)
      {
        var minLongitude=parseFloat(myLocation.longitude-0.1);
        var maxLongitude=parseFloat(myLocation.longitude)+0.1;
        var minlatitude=parseFloat(myLocation.latitude-0.1);
        var maxlatitude=parseFloat(myLocation.latitude)+0.1;
        var query ={'longitude':{$gt:minLongitude,$lt:maxLongitude},
                'latitude':{$gt:minlatitude,$lt:maxlatitude},'datemodified':{$gt:user.datemodified},'deleted':false};
        console.log(query);
        Location.find(query,function(err,result){
          if(err)return callback(null);
          console.log(result);
          callback(result);
        });

  //      console.log(JSON.stringify(query));
//        dbo.collection('locations').find(query).toArray(function(err,result){
  //          if(err)return callback(null);
//            callback(result);
//        });
      }
      function GetNearbyUnapprovedLocations(myLocation,callback)
      {
        var minLongitude=parseFloat(myLocation.longitude-0.00025);
        var maxLongitude=parseFloat(myLocation.longitude)+0.00025;
        var minlatitude=parseFloat(myLocation.latitude-0.00025);
        var maxlatitude=parseFloat(myLocation.latitude)+0.00025;
        var query ={'longitude':{$gt:minLongitude,$lt:maxLongitude},
                'latitude':{$gt:minlatitude,$lt:maxlatitude},
                'approved':false,
                'deleted':false};
      //  console.log(query);
        Location.find(query,function(err,result){
          if(err)return callback(null);
        //  console.log(result);
          callback(result);
        });

  //      console.log(JSON.stringify(query));
//        dbo.collection('locations').find(query).toArray(function(err,result){
  //          if(err)return callback(null);
//            callback(result);
//        });
      }
      function GetDeletedLocationsByDateModified(myLocation,user,callback)
      {
        var minLongitude=parseFloat(myLocation.longitude-0.1);
        var maxLongitude=parseFloat(myLocation.longitude)+0.1;
        var minlatitude=parseFloat(myLocation.latitude-0.1);
        var maxlatitude=parseFloat(myLocation.latitude)+0.1;
        var query ={'longitude':{$gt:minLongitude,$lt:maxLongitude},
                'latitude':{$gt:minlatitude,$lt:maxlatitude},'datemodified':{$gt:user.datemodified},'deleted':true};
        Location.find(query,function(err,result){
          if(err)callback(null);
          callback(result);
        });
      }
      function DeleteLocation(locationid,callback)
    {
          GetLocationById(locationid,function(location){
                if(location!=null)
                {
                  location.datemodified=new Date();
                  location.deleted=true;
                  location.save((err)=>{
                    if(err)callback(null);
                    callback(location);
                  });
  //                dbo.collection('deletedlocations').insertOne(location,function(err,res){
  //                    if(err)callback(null);
  //                    var query={id:locationid};
  //                    dbo.collection('locations').deleteOne(query,function(err){
  //                          if(err)callback(null);

  //                          callback(location);
  //                    });

  //                  });

                }
                else callback(null);
          });
    }
