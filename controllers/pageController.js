// pageController.js
// Import page model
Page = require('../models/pageModel.js');
// Import book model
Book = require('../models/bookModel.js');
// default path of pages recordings
var Path = '/app/audio/pages/';
// Import file stream
const fs = require('fs');
// Handle index actions
exports.index = {
  handler:function (req, res) {
    Page.get(function (err, pages) {
        if (err) {
            res({
                status: "error",
                message: err,
            });
        }
        res({
            status: "success",
            message: "pages retrieved successfully",
            data: pages
        });
    });
}
};
// Handle create page actions
exports.new = {
  handler:function (req, res) {
    var page = new Page();
    page.page_recording = req.payload.page_recording ? req.payload.page_recording : page.page_recording;
    page.page_state = false;
    page.page_number = req.payload.page_number;
    page.book = req.payload.book;
    page.volunteer_id = req.payload.volunteer_id;
    page.file_path = req.payload.file_path;

    // handling new bytes stream
    if(req.payload.page_recording) {
      page.page_state = true;
      if (page.page_number == page.book.page_number) {
        page.book.book_state = "Completed";
        updateBookState(page.book._id, "Completed");
      } else if (page.page_number == 1) {
        page.book.book_state = "Ongoing";
        updateBookState(page.book._id, "Ongoing");
      }
    }

    // save the page and check for errors
    page.save(function (err) {
        if (err)
          res(err);
        res({
          message: 'New page created!',
          data: page
        });
    });
}
};
// Handle view page info
exports.view = {
  handler:function (req, res) {
    Page.findById(req.params.page_id, function (err, page) {
        if (err)
            res(err);
        res({
            message: 'page details loading..',
            data: page
        });
    });
}
};
// Handle update page info
exports.update = {
  handler:function (req, res) {
Page.findById(req.params.page_id, function (err, page) {
        if (err)
            res(err);
        page.page_recording = req.payload.page_recording ? req.payload.page_recording : page.page_recording;
        page.page_state = req.payload.page_state ? req.payload.page_state : page.page_state;
        page.page_number = req.payload.page_number ? req.payload.page_number : page.page_number;
        page.book = req.payload.book ? req.payload.book : page.book;
        page.volunteer_id = req.payload.volunteer_id ? req.payload.volunteer_id : page.volunteer_id;
        page.file_path = req.payload.file_path ? req.payload.file_path : page.file_path;

        // handling new bytes stream
        if(req.payload.page_recording) {
          page.page_state = true;
          if (page.page_number === page.book.page_number) {
            page.book.book_state = "Completed";
            updateBookState(page.book._id, "Completed");
          } else if (page.page_number === 1) {
            page.book.book_state = "Ongoing";
            updateBookState(page.book._id, "Ongoing");
          }
        }

        // save the page and check for errors
        page.save(function (err) {
            if (err)
                res(err);
            res({
                message: 'page Info updated',
                data: page
            });
        });
    });
}
};
// Handle delete page
exports.delete = {
  handler:function (req, res) {
    Page.remove({
        _id: req.params.page_id
    }, function (err, page) {
        if (err)
          res(err);
        res({
          status: "success",
          message: 'page deleted'
        });
    });
}
};
// handle book pages
exports.bookPages = {
  handler:function (req, res) {
  var skipping = Number(req.query.skipping);
  if (req.query.skipping < 1) {
    skipping = 0;
  }
  Page.find({'book._id' : req.params.book_id, 'page_state' : true}, null, {skip : skipping}, (err, pages) => {
    if (err) {
        res({
            status: "error",
            message: err,
        });
    }
    res({
        status: "success",
        message: "book pages retrieved successfully",
        data: pages
    });
  }).sort({page_number : 1}).limit(5);
}
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
