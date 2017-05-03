const token = process.env.FB_PAGE_TOKEN;
const vtoken = process.env.FB_VERIFY_TOKEN;
const appSecret = process.env.FB_APP_SECRET;

const port = process.env.PORT || 5000;

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

const pickColorMsg = {
  'text': 'Pick a color:',
  'quick_replies': [
    {
      'content_type': 'text',
      'title': 'Red',
      'payload': 'CHOSE_RED'
    },
    {
      'content_type': 'text',
      'title': 'Green',
      'payload': 'CHOSE_GREEN'
    }
  ]
};

const handleResponse = (response) => {
  switch (response) {
    case 'CHOSE_GREEN':
      return 'My favorite color is green!';
      break;
    case 'CHOSE_RED':
      return 'I hate red!';
      break;
    default:
      break;
  }
};

bot.on('message', (payload, reply) => {
  let {text, quick_reply} = payload.message;
  let answer = '';
  
  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;

    reply(pickColorMsg, (err) => {
      if (err) throw err;

      if (quick_reply) {
        answer = handleResponse(quick_reply.payload);
      }

      reply({text: answer }, (err) => {});

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${answer} ${text}`);
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
  res.end(JSON.stringify({status: 'ok', reply: req.body || req.body.message || 'Nothing'}));
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }

  console.log(`FB Bot Server is listening on ${port}`);
});

module.exports = app;
