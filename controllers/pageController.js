// pageController.js
// Import page model
Page = require('../models/pageModel.js');

// Handle index actions
exports.index = function (req, res) {
    Page.get(function (err, pages) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "pages retrieved successfully",
            data: pages
        });
    });
};

// Handle create page actions
exports.new = function (req, res) {
    var page = new Page();
    page.page_recording = req.body.page_recording ? req.body.page_recording : page.page_recording;
    page.page_state = req.body.page_state;
    page.page_number = req.body.page_number;
    page.book_id = req.body.book_id;
    page.volunteer_id = req.body.volunteer_id;
    page.file_path = req.body.file_path;

    // save the page and check for errors
    page.save(function (err) {
        if (err)
          res.json(err);
        res.json({
          message: 'New page created!',
          data: page
        });
    });
};

// Handle view page info
exports.view = function (req, res) {
    Page.findById(req.params.page_id, function (err, page) {
        if (err)
            res.send(err);
        res.json({
            message: 'page details loading..',
            data: page
        });
    });
};

// Handle update page info
exports.update = function (req, res) {
Page.findById(req.params.page_id, function (err, page) {
        if (err)
            res.send(err);
        page.page_recording = req.body.page_recording ? req.body.page_recording : page.page_recording;
        page.page_state = req.body.page_state ? req.body.page_state : page.page_state;
        page.page_number = req.body.page_number ? req.body.page_number : page.page_number;
        page.book_id = req.body.book_id ? req.body.book_id : page.book_id;
        page.volunteer_id = req.body.volunteer_id ? req.body.volunteer_id : page.volunteer_id;
        page.file_path = req.body.file_path ? req.body.file_path : page.file_path;

        // save the page and check for errors
        page.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'page Info updated',
                data: page
            });
        });
    });
};

// Handle delete page
exports.delete = function (req, res) {
    Page.remove({
        _id: req.params.page_id
    }, function (err, page) {
        if (err)
          res.send(err);
        res.json({
          status: "success",
          message: 'page deleted'
        });
    });
};
