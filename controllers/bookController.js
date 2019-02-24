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
exports.index = function (req, res) {
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
              res.json({
                  status: "error",
                  message: err,
              });
          }
          res.json({
              status: "success",
              message: "books retrieved successfully",
              data: books
          });
        }
      ).sort({order_number : -1});
    } else {
      Book.get(function (err, books) {
          if (err) {
              res.json({
                  status: "error",
                  message: err,
              });
          }
          res.json({
              status: "success",
              message: "books retrieved successfully",
              data: books
          });
      });
    }
};

// Handle create book actions
exports.new = function (req, res) {
    var book = new Book();
    var book_data = req.body.book_data;
    book.title = req.body.title ? req.body.title : book.title;
    book.file_path = req.body.file_path;
    book.page_number = req.body.page_number;
    book.book_state = "Beginning";
    book.order_number = 1;

    // handling bytes stream
    customPath = (Path + book.title + '.pdf');
    book.file_path = customPath;
    fs.writeFile(customPath, book_data, (err) => {
      if(err) res.send(err);
      console.log('eBook have been saved successfully!!');
    });

    // save the book and check for errors
    book.save(function (err) {
        if (err)
          res.json(err);
        res.json({
          message: 'New book created!',
          data: book
        });
    });
};

// Handle Book content
exports.lastPageRead = function (req, res) {
    var book_id = req.params.book_id;
    if (req.query.all && req.query.all == 1) {
      Page.find({'book._id' : book_id}, (err, pages) => {
        if (err)
          res.json(err);
        res.json({
          message: 'Book content retrieved!',
          data: pages
        });
      });
    } else {
      Page.findOne({'book._id' : book_id, page_state : 0}, (err, page) => {
        if (err)
          res.json(err);
        res.json({
          message: 'Last page retrieved!',
          data: page
        });
      }).sort({page_number : -1});
    }
};

// Handle view book info
exports.view = function (req, res) {
    Book.findById(req.params.book_id, function (err, book) {
        if (err)
            res.send(err);
        res.json({
            message: 'book details loading..',
            data: book
        });
    });
};

// Handle update book info
exports.update = function (req, res) {
Book.findById(req.params.book_id, function (err, book) {
        if (err)
            res.send(err);
        book.title = req.body.title ? req.body.title : book.title;
        book.book_state = req.body.book_state ? req.body.book_state : book.book_state;
        book.file_path = req.body.file_path ? req.body.file_path : book.file_path;
        book.page_number = req.body.page_number ? req.body.page_number : book.page_number;
        book.last_page_downloaded = req.body.last_page_downloaded ? req.body.last_page_downloaded : book.last_page_downloaded;
        book.order_number = req.body.order_number ? req.body.order_number : book.order_number;
        // save the book and check for errors
        book.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'book Info updated',
                data: book
            });
        });
    });
};

// Handle delete book
exports.delete = function (req, res) {
    Book.remove({
        _id: req.params.book_id
    }, function (err, book) {
        if (err)
          res.send(err);
        res.json({
          status: "success",
          message: 'book deleted'
        });
    });
};

// Handle my books requests
exports.myBooks = function (req, res) {
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
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "books retrieved successfully",
            data: myBooks
        });
      });
  });
};
