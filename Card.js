const { createButtonList, createImageList } = require('./helpers');

class Card {
  constructor () {
    console.log('CARD');
  }

  single (choice) {
    return {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': [choice]
        }
      }
    };
  }

  list (results) {
    return {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'list',
          'top_element_style': 'compact',
          'elements': createImageList(results)
        }
      }
    };
  }

  buttons (ingredientsArray) {
    return {
      'text': 'Pick an ingredient:',
      'quick_replies': createButtonList(ingredientsArray)
    };
  }
}

module.exports = Card;
