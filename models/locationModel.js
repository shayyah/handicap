var mongoose=require('mongoose');
var locationSchema=mongoose.Schema({
  id:{
      type:String,
      require:true
  },
  longitude:{
      type:String,
      require:true
  },
  latitude:{
      type:String,
      require:true
  },
  address:{
      type:String,
      require:false
  },
  approved:{
      type:Boolean,
      require:false
  },
  deleted:{
    type:Boolean,
    require:false
  },
  datemodified:{
      type:Date,
      require:false
  }

});
var Location =module.exports=mongoose.model('Location',locationSchema);
module.exports.get = function (callback, limit) {
    Location.find(callback).limit(limit);
}
