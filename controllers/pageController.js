// pageController.js
// Import page model
Page = require('../models/pageModel.js');
// Import book model
Book = require('../models/bookModel.js');
// default path of pages recordings
var Path = 'D://ali-h/blind support/audio/pages/';
// Import file stream
const fs = require('fs');
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
    var audioBytes = req.body.page_recording ? req.body.page_recording : page.page_recording;
    page.page_state = false;
    page.page_number = req.body.page_number;
    page.book = req.body.book;
    page.volunteer_id = req.body.volunteer_id;
    page.file_path = req.body.file_path;

    // handling new bytes stream
    if(req.body.page_recording) {
      page.page_state = true;
      if (page.page_number === page.book.page_number) {
        page.book.book_state = "Completed";
        updateBookState(page.book._id, "Completed");
      } else if (page.page_number === 1) {
        page.book.book_state = "Ongoing";
        updateBookState(page.book._id, "Ongoing");
      }
      customPath = Path+page._id;
      fs.writeFile(customPath, audioBytes, (err) => {
        if(err) res.send(err);
        page.page_recording = customPath;
        console.log('Page recording have been updated successfully!!');
      });
    }

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
        var audioBytes = req.body.page_recording ? req.body.page_recording : page.page_recording;
        page.page_state = req.body.page_state ? req.body.page_state : page.page_state;
        page.page_number = req.body.page_number ? req.body.page_number : page.page_number;
        page.book = req.body.book ? req.body.book : page.book;
        page.volunteer_id = req.body.volunteer_id ? req.body.volunteer_id : page.volunteer_id;
        page.file_path = req.body.file_path ? req.body.file_path : page.file_path;

        // handling new bytes stream
        if(req.body.page_recording) {
          page.page_state = true;
          if (page.page_number === page.book.page_number) {
            page.book.book_state = "Completed";
            updateBookState(page.book._id, "Completed");
          } else if (page.page_number === 1) {
            page.book.book_state = "Ongoing";
            updateBookState(page.book._id, "Ongoing");
          }
          customPath = Path+page._id;
          if (fs.existsSync(customPath)) {
            fs.unlink(customPath, (err) => {
              if (res) res.send(err);
            });
            fs.writeFile(customPath, audioBytes, (err) => {
              if(err) res.send(err);
              page.page_recording = customPath;
              console.log('Page recording have been updated successfully!!');
            });
          }
        }

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

var updateBookState = function(book_id, book_state) {
  Book.findById(book_id, (err, book) => {
    book.book_state = book_state;
    book.save(function (err) {
        if (err)
            console.log(err);
    });
  });
};
