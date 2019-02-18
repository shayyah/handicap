var mongoose = require('mongoose');

var userSchema=mongoose.Schema({
    id:{
      type:String,
      required:true
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
    datemodified:{
      type:Date,
      required:false
    }

});
var User = module.exports = mongoose.model('User', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}
