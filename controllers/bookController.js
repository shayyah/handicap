// bookController.js
// Import book model
Book = require('../models/bookModel.js');
// Import page model
Page = require('../models/pageModel.js');
// Import Order model
Order = require('../models/orderModel.js');
// default path of pdf books
var Path = '/app/documents/books/';
// Import file stream
const fs = require('fs');
// Handle index actions
exports.index = {
  handler:function (req, res) {
    var filter = req.query.filter;
    var states = [
      'Beginning',
      'Ongoing'
    ];
    if(filter) {
      Book.find(
        {
          'book_state': { $in: states }
        }, (err, books) => {
          if (err) {
              res({
                  status: "error",
                  message: err,
              });
          }
          res({
              status: "success",
              message: "books retrieved successfully",
              data: books
          });
        }
      ).sort({order_number : -1});
    } else {
      Book.get(function (err, books) {
          if (err) {
              res({
                  status: "error",
                  message: err,
              });
          }
        res({
              status: "success",
              message: "books retrieved successfully",
              data: books
          });
      });
    }
}
};
// Handle create book actions
exports.new = {
  handler:function (req, res) {
    var book = new Book();
    book.book_data = req.payload.book_data;
    book.title = req.payload.title ? req.payload.title : book.title;
    book.file_path = req.payload.file_path;
    book.page_number = req.payload.page_number;
    book.book_state = "Beginning";
    book.order_number = 1;

    // save the book and check for errors
    book.save(function (err) {
        if (err)
          res(err);
        res({
          message: 'New book created!',
          data: book
        });
    });
}
};
// Handle Book content
exports.lastPageRead ={
  handler: function (req, res) {
    var book_id = req.params.book_id;
    if (req.query.all && req.query.all == 1) {
      Page.find({'book._id' : book_id}, (err, pages) => {
        if (err)
          res(err);
        res({
          message: 'Book content retrieved!',
          data: pages
        });
      });
    } else {
      Page.findOne({'book._id' : book_id, page_state : 0}, (err, page) => {
        if (err)
          res(err);
        res({
          message: 'Last page retrieved!',
          data: page
        });
      }).sort({page_number : -1});
    }
}
};
// Handle view book info
exports.view = {
  handler:function (req, res) {
    Book.findById(req.params.book_id, function (err, book) {
        if (err)
            res(err);
        res({
            message: 'book details loading..',
            data: book
        });
    });
}
};
// Handle update book info
exports.update ={
  handler: function (req, res) {
Book.findById(req.params.book_id, function (err, book) {
        if (err)
            res(err);
        book.title = req.payload.title ? req.payload.title : book.title;
        book.book_state = req.payload.book_state ? req.payload.book_state : book.book_state;
        book.file_path = req.payload.file_path ? req.payload.file_path : book.file_path;
        book.page_number = req.payload.page_number ? req.payload.page_number : book.page_number;
        book.last_page_downloaded = req.payload.last_page_downloaded ? req.payload.last_page_downloaded : book.last_page_downloaded;
        book.order_number = req.payload.order_number ? req.payload.order_number : book.order_number;
        // save the book and check for errors
        book.save(function (err) {
            if (err)
                res(err);
            res({
                message: 'book Info updated',
                data: book
            });
        });
    });
}
};
// Handle delete book
exports.delete = {
  handler:function (req, res) {
    Book.remove({
        _id: req.params.book_id
    }, function (err, book) {
        if (err)
          res(err);
        res({
          status: "success",
          message: 'book deleted'
        });
    });
}
};
// Handle my books requests
exports.myBooks = {
  handler:function (req, res) {
  var blind = req.params.blind_id;
  var books = [];
  Order.find({'blind_id' : blind, 'order_state' : true}, 'book_title', (err, book_titles) => {
    book_titles.forEach((element)=>{
      books.push(element.book_title);
    });
    Book.find(
      {
        'title' : { "$in": books }
      }, (err, myBooks) => {
        if (err) {
            res({
                status: "error",
                message: err,
            });
        }
        res({
            status: "success",
            message: "books retrieved successfully",
            data: myBooks
        });
      });
  });
}
};
