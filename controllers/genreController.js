const async = require('async');
const Genre = require('../models/genre');
const Book = require('../models/book');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([['type', 'ascending']])
    .exec((err, listGenre) => {
      if (err) { return next(err); }
      return res.render('genre_list', { title: 'Genre', genre_list: listGenre });
    });
};

exports.genre_detail = (req, res, next) => {
  async.parallel({
    genre: (callback) => {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    genre_books: (callback) => {
      Book.find({ genre: req.params.id })
        .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.genre == null) {
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    return res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
  });
};

exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'Create genre' });
};

exports.genre_create_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre create POST');
};

exports.genre_delete_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
};
