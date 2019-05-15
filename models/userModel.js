var mongoose = require('mongoose');

var userSchema=mongoose.Schema({
    id:{
      type:String,
      required:true
    },
    socketId:{
      type:String,
      required:false
    },
    name:{
      type:String,
      required:true
    },
    phone:{
      type:String,
      required:true
    },
    password:{
      type:String,
      required:true
    },
    sound:{
      type:String,
      required:false
    },
    location_count:{
      type:Number,
      require:false
    },
    datemodified:{
      type:Date,
      required:false
    },
    online:{
      type:Boolean,
      required:false
    },
    firebaseId:{
      type:String,
      required:false
    },
    unreadMessages:{
      type:Integer,
      required:false
    },
    lastOnline:{
      type:Date,
      required:false
    }
});
var User = module.exports = mongoose.model('User', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}
