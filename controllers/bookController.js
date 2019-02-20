// bookController.js
// Import book model
Book = require('../models/bookModel.js');

// Handle index actions
exports.index = function (req, res) {
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
};

// Handle create book actions
exports.new = function (req, res) {
    var book = new Book();
    book.title = req.body.title ? req.body.title : book.title;
    book.book_state = req.body.book_state;
    book.file_path = req.body.file_path;
    book.page_number = req.body.page_number;

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
