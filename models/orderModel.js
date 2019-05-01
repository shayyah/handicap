// orderModel.js
var mongoose = require('mongoose');
// update
// Setup schema
var orderSchema = mongoose.Schema({
    date : {
      type : Date,
      required : false,
      default : Date.now()
    },
    order_recording : {
      type : String,
      required : false
    },
    order_state : {
      type : Boolean,
      required : false
    },
    last_page_downloaded : {
      type : Number,
      required : false
    },
    book_title : {
      type : String,
      required : false
    },
    blind_id : {
      type : String,
      required : true
    },
    volunteer_id : {
      type : String,
      required : false
    },
    book_id : {
      type : String,
      required : false
    }
});

// Export Order model
var Order = module.exports = mongoose.model('Order', orderSchema);
module.exports.get = function (callback, limit) {
    Order.find(callback).limit(limit);
}
