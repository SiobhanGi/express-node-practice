const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
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
        let err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      return res.render('bookinstance_detail', { title: 'Book:', bookinstance });
    });
};

exports.bookinstance_create_get = (req, res, next) => {
  Book.find({},'title')
  .exec((err, books) => {
    if (err) { return next(err); }
     return res.render('bookinstance_form', { title: 'Create BookInstance', book_list:books });
  });
};

exports.bookinstance_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance create POST');
};

exports.bookinstance_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
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
