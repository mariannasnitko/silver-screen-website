const User = require('../models/user');
const fs = require('fs-promise');


module.exports = function (app, passport) {

    app.get('/auth/register', function (req, res) {
        res.render('register', {});
    });

    app.post('/auth/register', function (req, res) {
        User.findOne({ 'login': req.body.login }, (err, user) => {
            if (err) {
                res.status(500).send(err.toString());
            }
            if (user) {
                res.redirect('/auth/register' + '?error=Username+is+already+taken');
            }
            else {
                if (req.body.password === req.body.password2) {
                    let Url = '/images/usersPic/anon.png';
                    const user = {
                        id: null,
                        login: req.body.login,
                        password: User.schema.methods.generateHash(req.body.password).toString(),
                        role: 0,
                        fullname: req.body.fullname,
                        registeredAt: Date.now(),
                        avaUrl: Url,
                        isDisabled: false
                    };
                    User.schema.methods.insert(user)
                        .then(() => res.redirect('/auth/login'))
                        .catch(err => res.status(500).send(err.toString()));
                }
                else {
                    res.redirect('/auth/register' + '?error=Passwords+dont+match');
                }
            }
        });
    });

    app.get('/auth/login', function (req, res) {
        res.render('login', {});
    });

    app.post('/auth/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/auth/login' + '?error=Wrong+password',
            session: true
        }));

    app.get('/auth/logout', checkAuth, (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/', function (req, res) {
        if (!req.user) { res.render('index', { login2: 'You are not logged in!' }); }
        else
            res.render('inbex', { login2: req.user.login });
    });

    app.get('/about', function (req, res) {
        if (!req.user) { res.render('about', { login2: 'You are not logged in!' }); }
        else
            res.render('abt', { login2: req.user.login });
    });
};

function checkAuth(req, res, next) {
    if (!req.user) return res.render('unauth');
    next();
}