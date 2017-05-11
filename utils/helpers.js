const happy = decodeURI('\u2764');
const {bold: {yellow}} = require('chalk');

const _replacer = (key, value) => (key === 'postback') ? JSON.parse(value.payload) : value;
const _trim = str => str.replace(/(\r\n|\n|\r|\t)/gm, '');

const log = (event, obj) => console.log(yellow.bgBlack(`[${event}] Payload -`), JSON.stringify(obj, _replacer, 2));

const parseJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};
const createButtonList = (arr) => arr.map(o => ({
  content_type: 'text',
  title: o,
  payload: `CHOSE_${o.toUpperCase()}`
}));

const createImageList = (arr) => arr.map(o => ({
  title: _trim(o.title),
  image_url: o.thumbnail,
  subtitle: o.ingredients,
  buttons: [{
    type: 'postback',
    title: `${happy} - See More`,
    payload: JSON.stringify(
      {
        title: _trim(o.title),
        image_url: o.thumbnail,
        buttons: [
          {
            'type': 'web_url',
            'url': o.href,
            'title': 'View Recipe'
          },
          {
            'type': 'element_share'
          }]
      })
  }]
})
);

module.exports = {
  happy,
  log,
  parseJson,
  createButtonList,
  createImageList
};
