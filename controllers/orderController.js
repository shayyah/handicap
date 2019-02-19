// orderController.js
// Import order model
Order = require('../models/orderModel.js');

// Handle index actions
exports.index = function (req, res) {
    Order.get(function (err, orders) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "orders retrieved successfully",
            data: orders
        });
    });
};

// Handle create order actions
exports.new = function (req, res) {
    var order = new Order();
    order.date = req.body.date ? req.body.date : order.date;
    order.order_recording = req.body.order_recording;
    order.order_state = req.body.order_state;
    order.last_page_downloaded = req.body.last_page_downloaded;
    order.book_title = req.body.book_title;
    order.blind_id = req.body.blind_id;
    order.volunteer_id = req.body.volunteer_id;
    order.book_id = req.body.book_id;
    console.log(JSON.stringify(order));

    // save the order and check for errorss
    order.save(function (err) {
        if (err)
          res.json(err);
        res.json({
          message: 'New order created!',
          data: order
        });
    });
};

// Handle view order info
exports.view = function (req, res) {
    Order.findById(req.params.order_id, function (err, order) {
        if (err)
            res.send(err);
        res.json({
            message: 'order details loading..',
            data: order
        });
    });
};

// Handle update order info
exports.update = function (req, res) {
Order.findById(req.params.order_id, function (err, order) {
        if (err)
            res.send(err);
        order.date = req.body.date ? req.body.date : order.date;
        order.order_recording = req.body.order_recording ? req.body.order_recording : order.order_recording;
        order.order_state = req.body.order_state ? req.body.order_state : order.order_state;
        order.last_page_downloaded = req.body.last_page_downloaded ? req.body.last_page_downloaded : order.last_page_downloaded;
        order.book_title = req.body.book_title ? req.body.book_title : order.book_title;
        order.blind_id = req.body.blind_id ? req.body.blind_id : order.blind_id;
        order.volunteer_id = req.body.volunteer_id ? req.body.volunteer_id : order.volunteer_id;
        order.book_id = req.body.book_id ? req.body.book_id : order.book_id;

        // save the order and check for errors
        order.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'order Info updated',
                data: order
            });
        });
    });
};

// Handle delete order
exports.delete = function (req, res) {
    Order.remove({
        _id: req.params.order_id
    }, function (err, order) {
        if (err)
          res.send(err);
        res.json({
          status: "success",
          message: 'order deleted'
        });
    });
};
