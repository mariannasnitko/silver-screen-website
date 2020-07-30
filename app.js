const express = require('express');
const path = require('path');
const mustache = require("mustache-express");
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');
const mongoose = require('mongoose');
const config = require('./config.js');
const cloudinary = require('cloudinary');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Bot = require('./bot');

const app = express();

const viewsDir = path.join(__dirname, 'views');
app.engine("mst", mustache(path.join(viewsDir, "partials")));
app.set('views', viewsDir);
app.set('view engine', 'mst');
app.use(express.static('public'));

require('./passport')(passport);

app.use(busboy());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(busboyBodyParser({ limit: '5mb' }));

app.use(cookieParser());
app.use(session({
    secret: "*4*8*15*",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

require('./routes/auth.js')(app, passport);
require('./routes/users.js')(app, passport);
require('./routes/movies.js')(app, passport);
require('./routes/collections.js')(app, passport);
require('./routes/actors.js')(app, passport);

require('./routes/api.js')(app, passport);
//require('./routes/developer.js')(app, passport);

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

const databaseUrl = config.DatabaseUrl;
const serverPort = config.ServerPort;
const connectOptions = { useNewUrlParser: true };

mongoose.connect(databaseUrl, connectOptions)
    .then(() => console.log(`Database connected: ${databaseUrl}`))
    .then(() => app.listen(serverPort, () => console.log(`Server started: ${serverPort}`)))
    .catch(err => console.log(`Start error: ${err}`));