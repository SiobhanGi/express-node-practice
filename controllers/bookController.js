const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');
const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');

exports.index = (req, res) => {
  async.parallel({
    book_count: (callback) => {
      Book.countDocuments({}, callback);
    },
    book_instance_count: (callback) => {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available_count: (callback) => {
      BookInstance.countDocuments({ status: 'Available' }, callback);
    },
    author_count: (callback) => {
      Author.countDocuments({}, callback);
    },
    genre_count: (callback) => {
      Genre.countDocuments({}, callback);
    },
  }, (err, results) => {
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
};

exports.book_list = (req, res, next) => {
  Book.find({}, 'title author')
    .populate('author')
    .exec((err, listBooks) => {
      if (err) { return next(err); }
      return res.render('book_list', { title: 'Book List', book_list: listBooks });
    });
};

exports.book_detail = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },

    book_instance: (callback) => {
      BookInstance.find({ book: req.params.id })
        .exec(callback);
    },
  },

  (err, results) => {
    if (err) { return next(err); }
    if (results.book == null) {
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    return res.render('book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance });
  });
};

exports.book_create_get = (req, res, next) => {
  aync.parallel({
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    },
  }, (err, results) => {
      if (err) { return next(err); }
      return res.render('book_form', { title: 'Create book', authors: results.authors, genre: results.genre });
  });
};

exports.book_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create POST');
};

exports.book_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.book_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.book_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

exports.book_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update POST');
};
