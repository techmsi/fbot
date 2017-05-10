// Load Environment Variables
const dotenv = require('dotenv');
dotenv.load();
// Facebook - Messenger
const token = process.env.FB_PAGE_TOKEN;
const vtoken = process.env.FB_VERIFY_TOKEN;
const appSecret = process.env.FB_APP_SECRET;
const FBCard = require('./Card/FBCard');

const { happy, log } = require('./utils/helpers');
const port = process.env.PORT || 5000;
const API_ENDPOINT = 'http://www.recipepuppy.com/api/?i=';

const requestify = require('requestify');
const express = require('express');
const bodyParser = require('body-parser');
let app = express();

const Bot = require('messenger-bot');

let bot = new Bot({
  token: token,
  verify: vtoken,
  app_secret: appSecret
});

const RecipeCard = new FBCard();
let pickIngredientMsg = RecipeCard.buttons(['onions', 'garlic', 'rice']);

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('postback', (payload, reply, actions) => {
  log('choice - postback', payload);
  let { payload: choice } = payload.postback;
  let choiceObj = JSON.parse(choice);
  let card = RecipeCard.single(choiceObj);

  reply({ text: `I made this last night. ${happy} Mmmm... \n\nCan't wait to see how your "${choiceObj.title}" comes out.` }, (err, info) => {
    reply(card, (err, info) => {
    });
  });
});

bot.on('message', (payload, reply) => {
  let senderId = payload.sender.id;
  let {text, quick_reply} = payload.message;

  bot.getProfile(senderId, (err, profile) => {
    if (err) throw err;

    let {first_name, last_name} = profile;

    reply(pickIngredientMsg, (err) => {
      if (err) throw err;

      if (quick_reply) {
        requestify
          .get(`${API_ENDPOINT}${text}`)
          .then(r => JSON.parse(r.body))
          .then(({results}) => {
            // Get the response body
            let cards = RecipeCard.list(results.slice(0, 3));
            log(`recipes (${results.length})`, cards);
            return cards;
          })
          .then(cards => {
            reply(cards, (err) => {
            });
          });
      }

      console.log(`Echoed back to ${first_name} ${last_name}: "${text}"`);
      log('message', payload);
    });
  });
});

// Handle verification and Messaging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.send({status: 'ok', message: 'FB Bot Server is healthy'});
});

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
