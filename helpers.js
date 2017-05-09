const happy = decodeURI('\u2764');
const _log = (event, obj) => console.log(`[${event}] Payload -`, JSON.stringify(obj, null, 2));

const _trim = str => str.replace(/(\r\n|\n|\r|\t)/gm, '');

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
    title: `${happy} - View`,
    payload: JSON.stringify(
      {
        title: _trim(o.title),
        image_url: o.thumbnail,
        buttons: [
          {
            'type': 'web_url',
            'url': o.href,
            'title': 'View Recipe'
          }]
      })
  }]
})
);

module.exports = {
    happy,
    _log,
    createButtonList,
    createImageList
};