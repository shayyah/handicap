// pageModel.js
var mongoose = require('mongoose');

// Setup schema
var pageSchema = mongoose.Schema({
    page_recording : {
      type : String,
      required : false
    },
    page_state : {
      type : Boolean,
      required : false
    },
    page_number : {
      type : Number,
      required : false
    },
    book_id : {
      type : Number,
      required : false
    },
    volunteer_id : {
      type : Number,
      required : false
    },
});

// Export page model
var Page = module.exports = mongoose.model('Page', pageSchema);
module.exports.get = function (callback, limit) {
    Page.find(callback).limit(limit);
}
