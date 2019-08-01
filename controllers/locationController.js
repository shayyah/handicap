var shortid = require('short-id');
var fs=require('fs');
Location = require('../models/locationModel.js');
var Citytime =require('../models/citytimeModel.js');
var UserController =require('../controllers/userController');
//var dbo;
//var MongoClient = require('mongodb').MongoClient;
//var db_uri = 'mongodb://127.0.0.1:27017/blind_support_data';
//var db_params = { useNewUrlParser : true };
//MongoClient.connect(db_uri, db_params,function(err,db){
//    dbo =db.db('blind_support_data');
//});
var path="C:/Users/salim-s/Desktop/blind support/sound/";


exports.getlocations={
  handler: function(req,res){


//  GetAllPublicLocations(function(locations){
//            if(locations!=null)
//              res.json({locations:locations,deletedlocations:locations});
//            else res.json({message:'error'});
//          });

   var UserId=req.query.id;
         var UserLocation={
           longitude:req.query.longitude,
           latitude:req.query.latitude
         };
         var city=req.query.city;
         if(city==null||city=='')
         {
           city='Damascus';
         }
         console.log(UserId);
         UserController.getUser(UserId,function(MyUser){


         console.log('get public location');

             if(MyUser!=null)
             {

                GetCityTime(city,MyUser.id,function(citytime){


                     var date=new Date("2019-01-01T00:00:00.123Z");
                      if(citytime!=null)
                      {
                          date=citytime.last_update;
                          UpdateCityTime(citytime,new Date(),MyUser.id,function(newcitytime){
                              console.log('add new citytime  '+newcitytime);
                          });
                      }
                      else {
                        AddnewCityTime(city,new Date(),MyUser.id,function(newcitytime){
                            console.log('add new citytime  '+newcitytime);
                        });
                      }
                      GetLocationByUserLocation(UserLocation,MyUser,date,city,function(locations){

                        console.log('locations' + locations.length);
                          if(locations!=null)
                          {
                              GetDeletedLocations(UserLocation,MyUser,date,city,function(deletedlocations){

                                  if(deletedlocations!=null)
                                  {
                                    //  UserController.ModifyUserDate(MyUser.id,new Date());
                                      res({locations:locations,deletedlocations:deletedlocations});

                                 }
                                  else {
                                    res({message:'error'});
                                  }
                              });
                          }
                          else res({message:'error'});
                        });

                  });

             }
             else res({message:'error'});
         });
}
};
exports.addlocation={
  handler:function(req,res){
        var id=req.payload.id;
        var longitude=parseFloat(req.payload.longitude);
        var latitude=parseFloat(req.payload.latitude);
        var address=req.payload.address;
        var text=req.payload.text;
        var city=req.payload.city;

        var ispublic=false;
        console.log(address);
        UserController.getUser(id,function(MyUser){

          if(MyUser!=null&&MyUser.role==UserRole.Blind&&MyUser.location_count<20)
            {
              CreateLocationAndAddToDataBase(id,longitude,latitude,address,text,ispublic,city,function(myLocation){
              if(myLocation!=null)
              {
                res(myLocation);
                UserController.Updatelocation_count(MyUser,1);
              }
              else res({message:'error'});
              });
          }
          else {
          //  res.json(MyUser);

          res({message:'cant add location'});
          }
      });
}
};
exports.getmylocations={
  handler:function(req,res){
    var id=req.query.id;
    UserController.getUser(id,function(myPlayer){
        GetMyLocations(id,function(result){
            if(result!=null)
            {
              res({'myLocations':result});
            }
            else res({message:'error'});
        });
    });
}
};
exports.addpubliclocation={
  handler:function(req,res){
        var id='';
        var longitude=parseFloat(req.payload.longitude);
        var latitude=parseFloat(req.payload.latitude);
        var address=req.payload.address;
        var ispublic=true;
        var city=req.payload.city;
        if(city==null||city=='')
        {
          city='Damascus';
        }
        console.log('addpublic  '+address);
        var text=req.payload.text;
        console.log(address);
    //    UserController.getUser(req.body.id,function(MyUser){

              CreateLocationAndAddToDataBase(id,longitude,latitude,address,text,ispublic,city,function(myLocation){
              if(myLocation!=null)
              {
                res(myLocation);
              }
              else res({message:'error'});
              });

  //    });
}
};
exports.deletelocation={
  handler:function(req,res){
  DeleteLocation(req.payload.id,function(location){
    if(location!=null)
    {
      res(location);
    }
    else res({message:'error'});
  });
}
};
exports.changestate={
  handler:function(req,res){
  console.log("puuut");
          var id=req.payload.id;
          var state=req.payload.state;
            console.log(state);
          if(state=='true')
          {

              ApproveLocation(id,function(location){
                if(location!=null)
                {
                  res(location);
                }
                else {
                  res({message:'error'});
                }
              });
          }
          else {
              DeleteLocation(id,function(location){
                if(location!=null)
                {
                  res(location);
                  UserController.getUser(location.user_id,function(MyUser){
                    if(MyUser!=null)
                      UserController.Updatelocation_count(MyUser,-1);
                  });

                }
                else {
                  res({message:'error'});
                }
              });
          }
        }
      };
exports.getpubliclocations={
  handler:function(req,res)
{
  //var id=req.query.id;
//  UserController.getUser(id,function(MyUser){
//    console.log(JSON.stringify(MyUser));
  //    if(MyUser!=null)
  //    {
          GetAllPublicLocations(function(locations){
            if(locations!=null)
              res({'publicLocations':locations});
            else res({message:'error'});
          });
//      }
  //    else res.json({message:'error'});
  //  });
}
};
exports.getnearbylocation={
  handler:function(req,res){
  var id=req.query.id;
  var UserLocation={
    longitude:req.query.longitude,
    latitude:req.query.latitude
  };
  UserController.getUser(id,function(MyUser){
//    console.log(JSON.stringify(MyUser));
      if(MyUser!=null&&MyUser.role==UserRole.Blind)
      {
          GetNearbyUnapprovedLocations(UserLocation,function(locations){
            if(locations!=null)
              res({nearbyLocations:locations});
            else res({message:'error'});
          });
      }
      else res({message:'error'});
    });
}
};
function AddnewCityTime(city,time,userid,callback)
{

    var citytime=new Citytime();
    citytime.id=shortid.generate();
    citytime.user_id=userid;
    citytime.last_update=time;
    citytime.city=city;
    citytime.save(function(err){
      if(err)callback(null);
      else callback(citytime);
    });



}
function UpdateCityTime(city,time,userid,callback)
{
  city.last_update=time;
  city.save(function(err){
      if(err)callback(err);
      else callback(city);
  });
}
function GetCityTime(cityName,userId,callback)
{

    var query={'user_id':userId,'city':cityName};
    Citytime.findOne(query,function(err,res){
        if(err)callback(null);
        else callback(res);
    });


}
function GetMyLocations (id,callback){
  var query ={'user_id':id,'isPublic':false};
  Location.find(query,function(err,res){
      if(err)callback(null)
      callback(res);
  });
}
function GetAllPublicLocations(callback){
  var query={'isPublic':true,'deleted':false};
  Location.find(query,function(err,result){
    if(err)callback(null);
    callback(result);
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
      function CreateLocationAndAddToDataBase(rid,rlongitude,rlatitude,raddress,text,ispublic,rcity,callback)
      {

  //      console.log(JSON.stringify(UserController));
        var location=new Location();
          location.id=shortid.generate();
          location.user_id=rid;
          location.longitude=rlongitude;
          location.latitude=rlatitude;
          location.city=rcity;
      //    location.address="";
          location.text=text;
          location.approved=true;
          location.deleted=false;
          location.isPublic=ispublic;
          location.datemodified=new Date();

    //    console.log(JSON.stringify(location));
    //    fs.writeFile(path+location.id,raddress,(err)=>{
    //      if(err)callback(null);
          location.address=raddress;//path+location.id;
          location.save((err)=>{
              if(err)callback(null);
              callback(location);
          });
    //      dbo.collection('locations').insertOne(Location,function(err,res){
  //            if(err)callback(null);
    //          console.log('location inserted   '+JSON.stringify(Location));
    //          callback(Location);
    //        });
  //      });
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
      function GetLocationByUserLocation(myLocation,user,date,cityname,callback)
      {
        console.log('date   '+date);
        var minLongitude=parseFloat(myLocation.longitude-0.2);
        var maxLongitude=parseFloat(myLocation.longitude)+0.2;
        var minlatitude=parseFloat(myLocation.latitude-0.2);
        var maxlatitude=parseFloat(myLocation.latitude)+0.2;
        var query ={'longitude':{$gt:minLongitude,$lt:maxLongitude},
                'latitude':{$gt:minlatitude,$lt:maxlatitude},'deleted':false,'isPublic':true,
              'datemodified':{$gt:date},'city':cityname
            };
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
                'deleted':false,'isPublic':true};
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
      function GetDeletedLocations(myLocation,user,date,cityname,callback)
      {
        var minLongitude=parseFloat(myLocation.longitude-0.2);
        var maxLongitude=parseFloat(myLocation.longitude)+0.2;
        var minlatitude=parseFloat(myLocation.latitude-0.2);
        var maxlatitude=parseFloat(myLocation.latitude)+0.2;
        var query ={'longitude':{$gt:minLongitude,$lt:maxLongitude},
                'latitude':{$gt:minlatitude,$lt:maxlatitude},'deleted':true,'isPublic':true,'datemodified':{$gt:date},
                'city':cityname
              };
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
