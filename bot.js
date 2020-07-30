const Bot = require('node-telegram-bot-api');
const config = require('./config');
const User = require('./models/user');
const Movie = require('./models/movie');
const Collection = require('./models/collection');

const bot = new Bot(config.token, { polling: true });

bot.on("polling_error", (err) => console.log(err));

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome here at SilverScreen bot! - \"/setlogin login\" ");     
});

bot.onText(/\/setlogin (.+)/, (msg, [src, match]) => {
    const id = msg.chat.id; 
    let currUser = 0;
    
    User.schema.methods.getByLogin(match)
    .then(user =>{
        currUser = user;
        let us = { login: currUser.login, password: currUser.password, role: currUser.role, registeredAt: currUser.registeredAt, avaUrl: currUser.avaUrl, fullname: currUser.fullname, isDisabled: currUser.isDisabled, chatId: id };
        bot.sendMessage(msg.chat.id, `${us.login} is logged in!`);
            return User.schema.methods.updateX(currUser.id, us);
        })
        .then(() => console.log("success"))
        .catch(err => console.log(err));
});

bot.onText(/\/movies/, (msg) => {
    const id = msg.chat.id;

    Movie.getAll()
        .then( movies => {
            const text = movies.map( (c) => {
                return `${c.title} /c${c._id}`;
            }).join('\n');
            bot.sendMessage(id, text, {parse_mode: "HTML"});
        })
        .catch(err => console.log(err));
});