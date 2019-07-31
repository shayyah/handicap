var mongoose=require('mongoose');
var citytimeSchema=mongoose.Schema({
  id:{
      type:String,
      require:true
  },
  user_id:{
    type:String,
    require:true
  },
  city:{
    type:String,
    require:true
  },
  last_update:{
    type:Date,
    require:true
  }

});
var Citytime =module.exports=mongoose.model('citytime',citytimeSchema);
module.exports.get = function (callback, limit) {
    Citytime.find(callback).limit(limit);
}
