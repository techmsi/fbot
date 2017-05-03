const token = process.env.FB_PAGE_TOKEN;
const vtoken = process.env.FB_VERIFY_TOKEN;
const appSecret = process.env.FB_APP_SECRET;

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

bot.on('error', (err) => {
  console.log(err.message);
});

const pickIngredientMsg = {
  'text': 'Pick an ingredient:',
  'quick_replies': [
    {
      'content_type': 'text',
      'title': 'onions',
      'payload': 'CHOSE_ONIONS'
    },
    {
      'content_type': 'text',
      'title': 'garlic',
      'payload': 'CHOSE_GARLIC'
    }
  ]
};

const createList = o => o.map(o => ({
    title: o.title,
    image_url: o.thumbnail,
    subtitle: o.ingredients
  })
)

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
            let cards = createList(results.slice(0,3));
            let recipeCards = {
                "attachment":{
                "type":"template",
                "payload":{
                   "template_type": "list",
                    "top_element_style": "compact",
                    "elements": cards
                }
              }
            };

            reply(recipeCards, (err) => {});

            console.log('recipes', results.length);
          });
      }

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
      console.log(JSON.stringify(payload, null, 2));
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

  console.log(`FB Bot Server is listening on ${port}`);
});

module.exports = app;
