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
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    return res.render('book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance });
  });
};

exports.book_create_get = (req, res, next) => {
  async.parallel({
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    return res.render('book_form', { title: 'Create book', authors: results.authors, genres: results.genres });
  });
};

exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },
  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty.').isLength({ min: 1 }).trim(),

  sanitizeBody('*').trim().escape(),
  sanitizeBody('genre.*').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      },
    );

    if (!errors.isEmpty()) {
      async.parallel({
        authors: (callback) => {
          Author.find(callback);
        },
        genres: (callback) => {
          Genre.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        return res.render('book_form', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book,
          errors: errors.array(),
        });
      });
    } else {
      book.save((err) => {
        if (err) { return next(err); }
        return res.redirect(book.url);
      });
    }
  },
];

exports.book_delete_get = (req, res) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    bookinstance: (callback) => {
      BookInstance.find({
        book: req.params.id
      })
      .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.book == null) {
      return res.redirect('/catalog/books')
    }
    return res.render('book_delete', {
      title: 'Delete Author',
      book: results.book,
      bookinstance: results.bookinstance,
    });
  });
};

exports.book_delete_post = (req, res) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    bookinstance: (callback) => {
      BookInstance.find({
        book: req.params.id
      })
      .exec(callback);
    },
  }, (err, results) => {
    if (err) { return next(err) }
    if (results.bookinstance.length > 0) {
      res.render('book_delete', {
        title: 'Delete book',
        book: results.book,
        bookinstance: results.bookinstance,
      });
    } else {
      Book.findByIdAndRemove(req.body.id, (err) => {
        if (err) { return next(err); }
        return res.redirect('/catalog/books')
      });
    }
  });
};

exports.book_update_get = (req, res, next) => {
  async.parallel({
    book: (callback) => {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    authors: (callback) => {
      Author.find(callback);
    },
    genres: (callback) => {
      Genre.find(callback);
    },
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.book == null) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    for (let allGenre = 0; allGenre < results.genres.length; allGenre++) {
      for (let allBooks = 0; allBooks < results.book.genre.length; allBooks++) {
        if (results.genres[allGenre]
          ._id.toString() === results.book.genre[allBooks]._id
          .toString()) {
          results.genres[allGenre].checked = 'true';
        }
      }
    }
    return res.render('book_form', {
      title: 'Update book',
      authors: results.authors,
      genres: results.genres,
      book: results.book,
    });
  });
};

exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

  sanitizeBody('title').trim().escape(),
  sanitizeBody('author').trim().escape(),
  sanitizeBody('summary').trim().escape(),
  sanitizeBody('isbn').trim().escape(),
  sanitizeBody('genre.*').trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    const book = new Book(
      {
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
        _id: req.params.id,
      },
    );

    if (!errors.isEmpty()) {
      async.parallel({
        authors: (callback) => {
          Author.find(callback);
        },
        genres: (callback) => {
          Genre.find(callback);
        },
      }, (err, results) => {
        if (err) { return next(err); }
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        return res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book,
          errors: errors.array(),
        });
      });
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, thebook) => {
        if (err) { return next(err); }
        return res.redirect(thebook.url);
      });
    }
  },
];
