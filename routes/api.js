const User = require("../models/user.js");
const Movie = require("../models/movie.js");
const Collection = require("../models/collection.js");
const express = require('express');
const router = express.Router();
const BasicStrategy = require('passport-http').BasicStrategy;

module.exports = function (router, passport) {

  passport.use(new BasicStrategy((userid, password, done) => {
    User.find({ "login": userid.toString() })
      .then(user => {
        if (user[0] !== undefined && User.schema.methods.validPassword(user[0], password.toString()))
          done(null, user[0]);
        else done(null, false);
      })
      .catch(err => done(false));
  }));

  router.get('/api/v1/me', passport.authenticate('basic', { session: false }), function (req, res) {
    res.json(req.user);
  });

  router.get('/api/v1/users', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    User.schema.methods.getAll()
      .then(users => {
        const pageCount = Math.ceil(users.length / 3);
        let page = parseInt(req.query.p);
        if (!page) { page = 1; }
        if (page > pageCount) {
          page = pageCount;
        }
        res.json(users.slice(page * 3 - 3, page * 3));
      })
      .catch(err => res.json({ "error": err.toString() }));
  });

  router.get('/api/v1/movies', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    Movie.getAll()
      .then(movies => {
        const pageCount = Math.ceil(movies.length / 3);
        let page = parseInt(req.query.p);
        if (!page) { page = 1; }
        if (page > pageCount) {
          page = pageCount;
        }
        res.json(movies.slice(page * 3 - 3, page * 3));
      })
      .catch(err => res.json({ "error": err.toString() }));
  });

  router.get('/api/v1/collections', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    Collection.getAll()
      .then(cols => {
        const pageCount = Math.ceil(cols.length / 3);
        let page = parseInt(req.query.p);
        if (!page) { page = 1; }
        if (page > pageCount) {
          page = pageCount;
        }
        res.json(cols.slice(page * 3 - 3, page * 3));
      })
      .catch(err => res.json({ "error": err.toString() }));
  });

  router.post('/api/v1/movies', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    Movie.insert(new Movie(null, req.body.title, req.body.taglines, req.body.director, req.body.genre, req.body.date, parseInt(req.body.runtime), parseInt(req.body.rating), req.body.url))
      .then((movie) => {
        res.json(movie);
        res.status(201).send("Created");
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.post('/api/v1/collections', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const el = {
      id: null,
      title: req.body.title,
      type: req.body.type,
      author: req.body.author,
      // movies: null,
      likes: parseInt(req.body.likes),
      views: parseInt(req.body.views)
    };
    Collection.insert(new Collection(el))
      .then((col) => { res.json(col); res.status(201).send("Created"); })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.get('/api/v1/users/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    User.schema.methods.getById(id)
      .then(user => {
        if (typeof user === 'undefined') {
          res.status(404).send('User not found');
        }
        else {
          res.json(user);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.get('/api/v1/movies/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    Movie.getById(id)
      .then(movie => {
        if (typeof movie === 'undefined') {
          res.status(404).send('Movie not found');
        }
        else {
          res.json(movie);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.get('/api/v1/collections/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    Collection.getById(id)
      .then(col => {
        if (typeof col === 'undefined') {
          res.status(404).send('Collection not found');
        }
        else {
          res.json(col);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.put('/api/v1/users/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const element = {
      id: req.params.id,
      role: parseInt(req.body.role),
      login: req.body.login,
      fullname: req.body.fullname,
      isDisabled: parseInt(req.body.isDisabled),
      avaUrl: req.body.avaUrl
    };
    User.schema.methods.updateAll(element)
      .then((user1) => {
        if (typeof user1 === 'undefined') {
          res.status(404).send('User not found');
        }
        else {
          res.json(user1);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.put('/api/v1/movies/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const element = {
      id: req.params.id,
      title: req.body.title,
      taglines: req.body.taglines,
      genre: req.body.genre,
      date: req.body.date,
      runtime: parseInt(req.body.runtime),
      rating: parseInt(req.body.rating),
      posterUrl: req.body.posterUrl
    };
    Movie.update(element)
      .then((movie) => {
        if (typeof movie === 'undefined') {
          res.status(404).send('Movie not found');
        }
        else {
          res.json(movie);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.put('/api/v1/collections/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const el = {
      id: null,
      title: req.body.title,
      type: req.body.type,
      author: req.body.author,
      // movies: null,
      likes: parseInt(req.body.likes),
      views: parseInt(req.body.views)
    };
    Collection.update(el)
      .then((col) => {
        if (typeof col === 'undefined') {
          res.status(404).send('Collection not found');
        }
        else {
          res.json(col);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.delete('/api/v1/users/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    User.schema.methods.delete(id)
      .then(user => {
        if (typeof user === 'undefined') {
          res.status(404).send('User not found');
        }
        else {
          res.json(user);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.delete('/api/v1/movies/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    Movie.delete(id)
      .then(movie => {
        if (typeof movie === 'undefined') {
          res.status(404).send('Movie not found');
        }
        else {
          res.json(movie);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });

  router.delete('/api/v1/collections/:id', passport.authenticate('basic', { session: false }), checkAdmin, function (req, res) {
    const id = req.params.id;
    Collection.delete(id)
      .then(col => {
        if (typeof col === 'undefined') {
          res.status(404).send('Collection not found');
        }
        else {
          res.json(col);
        }
      })
      .catch(err => res.status(500).send(err.toString()));
  });
};

function checkAdmin(req, res, next) {
  if (req.user.role !== 1) return res.sendStatus(403);
  next();
}

function checkAuth(req, res, next) {
  if (!req.user) return res.sendStatus(401);
  next();
}