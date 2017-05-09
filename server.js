// Facebook - Messenger
const token = process.env.FB_PAGE_TOKEN;
const vtoken = process.env.FB_VERIFY_TOKEN;
const appSecret = process.env.FB_APP_SECRET;
const Card = require('./Card');

const { happy, _log } = require('./helpers');
const port = process.env.PORT || 5000;
const API_ENDPOINT = 'http://www.recipepuppy.com/api/?i=';

const requestify = require('requestify');
const express = require('express');
const bodyParser = require('body-parser');
const Bot = require('messenger-bot');

let bot = new Bot({
  token: token,
  verify: vtoken,
  app_secret: appSecret
});

const RecipeCard = new Card();
let pickIngredientMsg = RecipeCard.buttons(['onions', 'garlic', 'rice']);

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('postback', (payload, reply, actions) => {
  _log('postback', payload);
  let { payload: choice } = payload.postback;
  let choiceObj = JSON.parse(choice);
  let card = RecipeCard.single(choiceObj);

  reply({ text: `I made this last night. ${happy} Mmmm... \n\nCan't wait to see how your "${choiceObj.title}" comes out.` }, (err, info) => {
    reply(card, (err, info) => {});
  });
});

bot.on('message', (payload, reply) => {
  let {text, quick_reply} = payload.message;

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;

    reply(pickIngredientMsg, (err) => {
      if (err) throw err;

      if (quick_reply) {
        requestify.get(`${API_ENDPOINT}${text}`)
          .then(r => JSON.parse(r.body))
          .then(({results}) => {
            // Get the response body
            let cards = RecipeCard.list(results.slice(0, 3));
            reply(cards, (err) => {
            });

            console.log('recipes', cards.length);
          });
      }

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
      _log('message', payload);
    });
  });
});

// Handle verification and Messaging
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  return bot._verify(req, res);
});

app.post('/', (req, res) => {
  bot._handleMessage(req.body);
  res.end(JSON.stringify({status: 'ok', reply: req.body || 'Nothing'}));
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }

  console.log(`${happy} FB Bot Server is listening on ${port}`);
});

module.exports = app;
