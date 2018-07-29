const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');
const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');

exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, listBookInstances) => {
      if (err) { return next(err); }
      return res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: listBookInstances });
    });
};

exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) { return next(err); }
      if (bookinstance == null) {
        const err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      return res.render('bookinstance_detail', { title: 'Book:', bookinstance });
    });
};

exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, 'title')
    .exec((err, books) => {
      if (err) { return next(err); }
      return res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: books,
      });
    });
};

exports.bookinstance_create_post = [
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    const bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      },
    );

    if (!errors.isEmpty()) {
      Book.find({}, 'title')
        .exec((err, books) => {
          if (err) { return next(err); }
          return res.render('bookinstance_form', {
            title: 'Create BookInstance',
            book_list: books,
            selected_book: bookinstance.book._id,
            errors: errors.array(),
            bookinstance,
          });
        });
    } else {
      bookinstance.save((err) => {
        if (err) { return next(err); }
        return res.redirect(bookinstance.url);
      });
    }
  },
];

exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel({
    bookinstance: (callback) => {
      BookInstance.find({ book: req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.bookInstance == null) {
      const err = new Error('Copy not found.');
      err.status = 404;
      return next(err);
    }
    return res.render('bookinstance_delete', { title: 'Title', bookinstance: results.bookinstance });
  });
};

exports.bookinstance_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

exports.bookinstance_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};

exports.bookinstance_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};
