// orderController.js
// Import order model
Order = require('../models/orderModel.js');
// Import book model
Book = require('../models/bookModel.js');
// Default path of order recordings

var Path = process.cwd() + '/audio/orders/';
// Import file stream
const fs = require('fs');
// Handle index actions
exports.index = {
  handler:function (req, res) {
  var state = req.query.order_state;
  var skipping = 1;
  if (req.query.page <= 1) {
    skipping = 0;
  } else {
    skipping *= ((req.query.page-1) * 10);
  }
  if (state) {
    Order.find({order_state : state}, null, {skip : skipping}, (err, orders) => {
      if (err) {
          res({
              status: "error",
              message: err,
          });
      }
      res({
          status: "success",
          message: "orders retrieved successfully",
          data: orders
      });
    }).limit(10);
  } else {
    Order.get(function (err, orders) {
        if (err) {
            res({
                status: "error",
                message: err,
            });
        }
        res({
            status: "success",
            message: "orders retrieved successfully",
            data: orders
        });
    });
  }
}
};
// Handle create order actions
exports.new = {
  handler:function (req, res) {
    var order = new Order();
    order.date = new Date();
    order.order_recording = req.payload.order_recording;
    order.order_state = false;
    order.last_page_downloaded = 0;
    order.book_title = req.payload.book_title;
    order.blind_id = req.payload.blind_id;
    order.volunteer_id = req.payload.volunteer_id;
    order.book_id = req.payload.book_id;

    // save the order and check for errorss
    order.save(function (err) {
        if (err)
          res(err);
        res({
          message: 'New order created!',
          data: order
        });
    });
}
};
// Handle view order info
exports.view = {
  handler:function (req, res) {
    Order.findById(req.params.order_id, function (err, order) {
        if (err)
            res(err);
        res({
            message: 'order details loading..',
            data: order
        });
    });
}
};
// Handle update order info
exports.update = {
  handler:function (req, res) {
Order.findById(req.params.order_id, function (err, order) {
        if (err)
            res(err);
        order.order_state = req.payload.order_state ? req.payload.order_state : order.order_state;
        order.last_page_downloaded = req.payload.last_page_downloaded ? req.payload.last_page_downloaded : order.last_page_downloaded;
        order.book_title = req.payload.book_title ? req.payload.book_title : order.book_title;
        if (order.book_title) {
          order.order_state = true;
        }
        order.blind_id = req.payload.blind_id ? req.payload.blind_id : order.blind_id;
        order.volunteer_id = req.payload.volunteer_id ? req.payload.volunteer_id : order.volunteer_id;
        order.book_id = req.payload.book_id ? req.payload.book_id : order.book_id;

        // save the order and check for errors
        order.save(function (err) {
            if (err)
                res(err);
          res({
                message: 'order Info updated',
                data: order
            });
        });
    });
}
};
// Handle delete order
exports.delete = {
  handler:function (req, res) {
    Order.remove({
        _id: req.params.order_id
    }, function (err, order) {
        if (err)
          res(err);
        res({
          status: "success",
          message: 'order deleted'
        });
    });
}
};
// handle erasing the entire collection

exports.erase = {
  handler:function (req, res) {
  Order.remove({}, (err) => {
    if(err) res(err);
    res({
      status: "success",
      message: 'collection erased'
    });
  });
}
};
