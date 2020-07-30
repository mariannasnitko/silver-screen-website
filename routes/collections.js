const Collection = require("../models/collection.js");
const cloudinary = require('cloudinary');
const config = require('../config.js');

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

module.exports = function (app, passport) {

    app.get('/collections/newCol', checkAuth, checkAdmin, (req, res) => {
        res.render('newCol', { login2: req.user.login });
    });

    app.post('/collections/newCol', checkAuth, checkAdmin, function (req, res) {
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
            .then(() => res.redirect('/collections'))
            .catch(err => res.status(500).send(err.toString()));
    });

    app.get('/collections/:id', checkAuth, function (req, res) {
        const id = req.params.id;
        Collection.getById(id)
            .then(col => {
                if (typeof col === 'undefined') {
                    res.render('error');
                }
                else {
                    let movies = [col.movies.title];
                    console.log(movies);
                    if (!movies) movies = "";
                    res.render('collection', { movies, collection: col, login2: req.user.login });
                }
            })
            .catch(err => res.status(500).send(err.toString()));
    });

    app.post('/collections/:id', checkAuth, checkAdmin, (req, res) => {
        const id = req.params.id;
        Collection.delete(id)
            .then(col => {
                if (typeof col === 'undefined') {
                    res.render('error');
                }
                else {
                    res.redirect('/collections');
                }
            })
            .catch(err => res.status(500).send(err.toString()));
    });

    app.get('/collections', checkAuth, function (req, res) {
        let searchStr = req.query.search;
        if (!searchStr) searchStr = "";
        if (!req.query.page) req.query.page = 0;
        const lm = 3;
        let skp = req.query.page * lm;
        let entitiesCount = 0;

        Collection.getCollectionsCount(searchStr)
            .then(count => {
                entitiesCount = count;
                return Collection.getAll2(searchStr, skp, lm);
            })
            .then(cols => {
                let maxPage = Math.ceil(entitiesCount / 3);
                let maxPageOnSite = maxPage;
                const pageOnSite = +req.query.page + 1;
                let prevPage = +req.query.page - 1;
                let nextPage = +req.query.page + 1;
                let right, left = false;
                if (prevPage < 0) left = false;
                else left = true;
                if (nextPage >= maxPage) right = false;
                else right = true;
                if (maxPage > 1) maxPage = maxPage - 1;
                if (maxPageOnSite === 0) maxPageOnSite = 1;
                res.render('collections', { pageOnSite, right, left, prevPage, nextPage, maxPageOnSite, searchStr, count: entitiesCount, collections: cols, user: req.user, login2: req.user.login });
            })
            .catch(err => res.status(500).send(err.toString()));
    });
};

function checkAuth(req, res, next) {
    if (!req.user) return res.render('unauth');
    next();
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 1) return res.sendStatus(403);
    next();
}