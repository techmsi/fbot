const requestify = require('requestify');
const { happy, log, parseJson, createImageList } = require('./utils/helpers');

// Facebook - Config
const pageId = process.env.FB_PAGE_ID;
const pageAccessToken = process.env.FB_PAGE_TOKEN;
const verificationToken = process.env.FB_VERIFY_TOKEN;
const appSecret = process.env.FB_APP_SECRET;

// Facebook - Messenger Bot Setup
const Botly = require('botly');
const botly = new Botly({
  accessToken: pageAccessToken,
  verifyToken: verificationToken
});

const API_ENDPOINT = 'http://www.recipepuppy.com/api/?i=';
const ingredientsArray = ['onions', 'garlic', 'rice'];
const arrToButtons = arr => arr.map(item => botly.createPostbackButton(item, item.toUpperCase()));

// Text responses
const conversation = {
  get_started: `Would you like me to help you find something new to cook today?`,
  find_recipes: `Great! Pick an ingredient`,
  cancel: `No worries, we can chat later. Just type "hi" and I will respond.`,
  chose_recipe: `I made this last night. ${happy} Mmmm... \n\nCan't wait to see how your "----" comes out.`
};

let FBUser = null;

const getUser = (id) => {
  if (FBUser) {
    const {first_name: f, last_name: l} = FBUser;
    log('FBUser - exists', FBUser);
    return `${f} ${l}`;
  } else {
    botly.getUserProfile(id, (err, info) => {
      log('FBUser', info);
      // cache it
      FBUser = info;
    });
  }
};

let yesNoButtons = [
  botly.createPostbackButton('Yes', 'FIND_RECIPES'),
  botly.createPostbackButton('No', 'CANCEL')
];

botly.on('error', (err) => {
  log('error', err);
});

botly.on('postback', (id, message, postback, ref) => {
  log('postback', postback);
  const user = getUser(id);

  if (postback === 'GET_STARTED_CLICKED') {
    const text = `Hi, ${user}. ${conversation.get_started}`;
    const buttons = yesNoButtons;

    botly.sendButtons({id, text, buttons},
      (err, data) => {
      });
  }

  if (postback === 'CANCEL') {
    const text = conversation.cancel;

    botly.sendText({id, text});
  }

  if (postback === 'FIND_RECIPES') {
    const text = conversation.find_recipes;
    const buttons = arrToButtons(ingredientsArray);

    botly.sendButtons({id, text, buttons}
      , (err, data) => {
        // log it
      });
  }

  if (ingredientsArray.indexOf(postback.toLowerCase()) !== -1) {
    requestify
      .get(`${API_ENDPOINT}${postback}`)
      .then(r => JSON.parse(r.body))
      .then(({results}) => {
        // Get the response body
        let cards = createImageList(results.slice(0, 3));
        log(`recipes (${results.length})`, cards);
        return cards;
      })
      .then(cards => {
        botly.sendList({id, elements: cards}, (err, data) => {
        });
      });
  }

  if (typeof parseJson(postback) === 'object') {
    const elements = parseJson(postback);
    const text = conversation.chose_recipe.replace('----', elements.title);
    log('choice - postback', elements);

    botly.sendText({id, text});
    botly.sendGeneric({id, elements}, (err, data) => {
    });
  }
});

botly.on('message', (id, message, data) => {
  const user = getUser(id);
  const text = `Hi, ${user}. ${conversation.get_started}`;
  const buttons = yesNoButtons;

  botly.sendButtons({id, text, buttons},
    (err, data) => {
    });
});

module.exports = botly;
