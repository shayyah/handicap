// bookModel.js
var mongoose = require('mongoose');

// Setup schema
var bookSchema = mongoose.Schema({
    title : {
      type : String,
      required : true
    },
    book_data : {
      type : String,
      required : true
    },
    book_state : {
      type : String,
      required : false
    },
    file_path : {
      type : String,
      required : false
    },
    page_number : {
      type : Number,
      required : false
    },
    order_number : {
      type : Number,
      required : false
    }
});

// Export book model
var Book = module.exports = mongoose.model('Book', bookSchema);
module.exports.get = function (callback, limit) {
    Book.find(callback).limit(limit);
}
