const { createButtonList, createImageList } = require('../utils/helpers');
// Facebook Message Templates
const cardFBTemplate = require('./templates/cardFBTemplate'); // generic
const cardsFBTemplate = require('./templates/cardsFBTemplate'); // list

class FBCard {
  constructor () {
    this.card = cardFBTemplate;
    this.cards = cardsFBTemplate;
  }

  single (item) {
    this.card.attachment.payload.elements = [item];
    return this.card;
  }

  list (items) {
    this.cards.attachment.payload.elements = createImageList(items);
    return this.cards;
  }

  buttons (labels) {
    return {
      'text': 'Pick an ingredient:',
      'quick_replies': createButtonList(labels)
    };
  }
}

module.exports = FBCard;
