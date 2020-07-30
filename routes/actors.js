const Actor = require("../models/actor.js");
const cloudinary = require('cloudinary');
const config = require('../config.js');


cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

module.exports = function (app, passport) {

    app.get('/actors', checkAuth, function (req, res) {
        let searchStr = req.query.search;
        if (!searchStr) searchStr = "";
        if (!req.query.page) req.query.page = 0;
        const lm = 3;
        let skp = req.query.page * lm;
        let entitiesCount = 0;

        Actor.getActorsCount(searchStr)
            .then(count => {
                entitiesCount = count;
                return Actor.getAll2(searchStr, skp, lm);
            })
            .then(actors => {
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
                res.render('actors', { pageOnSite, right, left, prevPage, nextPage, maxPageOnSite, searchStr, count: entitiesCount, actors: actors, user: req.user, login2: req.user.login });
            })
            .catch(err => res.status(500).send(err.toString()));
    });

    // app.get('/actors/update/:id', checkAuth, checkAdmin, (req, res) => {
    //     const id = req.params.id;
    //     Actor.getById(id)
    //         .then(data => {
    //             const up = { linkUpdate: '/movies/update/' + data.id, data: data, login2: req.user.login };
    //             res.render('update', up);
    //         });
    // });

    // app.post('/movies/update/:id', checkAuth, checkAdmin, function (req, res) {
    //     let str = req.url;
    //     let arr = str.split("/", 3);
    //     let id = arr.pop();
    //     const fileObject = req.files.posterUrl;
    //     const fileBuffer = fileObject.data;
    //     cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
    //         function (error, result) {
    //             if (error) {
    //                 res.sendStatus(500);
    //                 return;
    //             }
    //             let Url = result.url;
    //             const element = {
    //                 id: id,
    //                 title: req.body.title,
    //                 taglines: req.body.taglines,
    //                 genre: req.body.genre,
    //                 date: req.body.date,
    //                 runtime: parseInt(req.body.runtime),
    //                 rating: parseInt(req.body.rating),
    //                 posterUrl: Url
    //             };
    //             Actor.update(element)
    //                 .then((movie) => res.redirect(`/movies/${movie.id}`))
    //                 .catch(err => res.status(500).send(err.toString()));
    //         })
    //         .end(fileBuffer);
    // });

    // app.get('/movies/new', checkAuth, checkAdmin, (req, res) => {
    //     res.render('new', { login2: req.user.login });
    // });

    // app.post('/movies/new', checkAuth, checkAdmin, function (req, res) {
    //     const fileObject = req.files.posterUrl;
    //     const fileBuffer = fileObject.data;
    //     cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
    //         function (error, result) {
    //             if (error) {
    //                 res.sendStatus(500);
    //                 return;
    //             }
    //             let Url = result.url;
    //             Actor.insert(new Actor(null, req.body.title, req.body.taglines, req.body.director, req.body.genre, req.body.date, parseInt(req.body.runtime), parseInt(req.body.rating), Url))
    //                 .then((movie) => {
    //                     res.redirect(`/movies/${movie.id}`);
    //                 })
    //                 .catch(err => res.status(500).send(err.toString()));
    //         })
    //         .end(fileBuffer);
    // });

    app.get('/actors/:id', checkAuth, function (req, res) {
        const id = req.params.id;
        Actor.getById(id)
            .then(actor => {
                if (typeof actor === 'undefined') {
                    res.status(404).send('Actor not found');
                }
                else {
                    res.render('actor', { actor: actor, login2: req.user.login });
                }
            })
            .catch(err => res.status(500).send(err.toString()));
    });

    app.post('/actors/:id', checkAuth, checkAdmin, (req, res) => {
        const id = req.params.id;
        Actor.delete(id)
            .then(actor => {
                if (typeof actor === 'undefined') {
                    res.status(404).send('Actor not found');
                }
                else {
                    cloudinary.v2.uploader.destroy(actor.public_id, function (error, result) {
                        console.log(result, error);
                    });
                    res.redirect('/actors');
                }
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

function getPageSize(arr, entitiesPerPage) {
    return Math.ceil(arr.length / entitiesPerPage);
}

function getEntitiesList(arr, page, entitiesPerPage) {
    const res = [];
    --page;

    for (let i = page * entitiesPerPage; i < page * entitiesPerPage + entitiesPerPage && i < arr.length; i++)
        res.push(arr[i]);
    return res;
}