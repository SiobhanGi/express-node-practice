const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');
const Author = require('../models/author');
const Book = require('../models/book');

exports.author_list = (req, res, next) => {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec((err, listAuthors) => {
      if (err) { return next(err); }
      return res.render('author_list', { title: 'Author List', author_list: listAuthors });
    });
};

exports.author_detail = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id)
        .exec(callback);
    },
    authors_books: (callback) => {
      Book.find({ author: req.params.id }, 'title summary')
        .exec(callback);
    },
  }, (err, result) => {
    if (err) { return next(err); }
    if (result.author == null) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    return res.render('author_detail', { title: 'Author Detail', author: result.author, author_books: result.authors_books });
  });
};

exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

exports.author_create_post = [
  body('first_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
    } else {
      const author = new Author(
        {
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          date_of_birth: req.body.date_of_birth,
          date_of_death: req.body.date_of_death,
        },
      );
      author.save((err) => {
        if (err) { return next(err); }
        return res.redirect(author.url);
      });
    }
  },
];

exports.author_delete_get = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.params.id)
        .exec(callback);
    },
    author_books: (callback) => {
      Book.find({ author: req.params.id })
        .exec(callback);
    },
  }, (err, result) => {
    if (err) { return next(err); }
    if (result.author == null) {
      return res.redirect('/catalog/authors');
    }
    return res.render('author_delete', {
      title: 'Delete Author',
      author: result.author,
      author_books: result.author_books,
    });
  });
};

exports.author_delete_post = (req, res, next) => {
  async.parallel({
    author: (callback) => {
      Author.findById(req.body.authorid)
        .exec(callback);
    },
    author_books: (callback) => {
      Book.find({ author: req.body.authorid })
        .exec(callback);
    },
  }, (err, result) => {
    if (err) { return next(err); }
    if (result.author_books.length > 0) {
      res.render('author_delete', {
        title: 'Delete Author',
        author: result.author,
        author_books: result.author_books,
      });
    } else {
      Author.findByIdAndRemove(req.body.authorid, (err) => {
        if (err) { return next(err); }
        return res.redirect('/catalog/authors');
      });
    }
  });
};

exports.author_update_get = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update GET');
};

exports.author_update_post = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update POST');
};
