'use strict';

var yo = require('yo-yo');
var history = require('history');

var set = require('set-value');

var classes = require('./classes');
var get = require('./utils/get');

var Input = require('./components/input');
var Select = require('./components/select');
var Textarea = require('./components/textarea');
var Checkbox = require('./components/checkbox');

var story = history.createHistory();

var redux = require('redux');

var rarities = require('./mappings').rarities;
var setNames = require('./mappings').setNames;
var typeTranslations = require('./mappings').typeTranslations;

var reducers = require('./reducers');

var store = redux.createStore(redux.combineReducers(reducers));

function updateForm(card) {
  var el = document.querySelector(classes.formContainer.selector);

  yo.update(el, formView(card));
}

var setNameOptions = [
  setNames.set1,
  setNames.set2,
  setNames.set3,
  setNames.set4,
  setNames.set5,
  setNames.set6,
  setNames.set7
];

var alignmentOptions = [
  'hero',
  'villain',
  'neutral'
];

var rarityOptions = [
  rarities[1],
  rarities[2],
  rarities[3],
  rarities[4],
  rarities[5],
  rarities[6],
  rarities[7]
];

var cardTypeOptions = [
  typeTranslations.ally,
  typeTranslations['physical combat'],
  typeTranslations['energy combat'],
  typeTranslations.mainpersonality,
  typeTranslations.setup,
  typeTranslations.drill,
  typeTranslations.dragonball,
  typeTranslations.event,
  typeTranslations.mastery
];

function stageHandler(idx) {
  return function(evt) {
    var state = store.getState();

    var stages = [].concat(state.stages);

    stages[idx] = evt.target.value;

    store.dispatch({ type: 'update_stages', payload: { stages: stages }});
  }
}

function stagesView() {
  var state = store.getState();

  var stages = state.stages;

  return [
    yo`<label for="stages[10]">Stages:</label>`,
    yo`<input id="stages[10]" name="stages[10]" value=${stages[10]} oninput=${stageHandler(10)} />`,
    yo`<input id="stages[9]" name="stages[9]" value=${stages[9]} oninput=${stageHandler(9)} />`,
    yo`<input id="stages[8]" name="stages[8]" value=${stages[8]} oninput=${stageHandler(8)} />`,
    yo`<input id="stages[7]" name="stages[7]" value=${stages[7]} oninput=${stageHandler(7)} />`,
    yo`<input id="stages[6]" name="stages[6]" value=${stages[6]} oninput=${stageHandler(6)} />`,
    yo`<input id="stages[5]" name="stages[5]" value=${stages[5]} oninput=${stageHandler(5)} />`,
    yo`<input id="stages[4]" name="stages[4]" value=${stages[4]} oninput=${stageHandler(4)} />`,
    yo`<input id="stages[3]" name="stages[3]" value=${stages[3]} oninput=${stageHandler(3)} />`,
    yo`<input id="stages[2]" name="stages[2]" value=${stages[2]} oninput=${stageHandler(2)} />`,
    yo`<input id="stages[1]" name="stages[1]" value=${stages[1]} oninput=${stageHandler(1)} />`,
    yo`<input id="stages[0]" name="stages[0]" value=${stages[0]} oninput=${stageHandler(0)} />`
  ];
}


var reduce = require('object.reduce');

function send(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  var location = story.getCurrentLocation();

  if (location.pathname === '/new') {
    createCard();
    return;
  }

  updateCard();
}

function buildBody(state, ignores) {
  var ignore = [
    '_id',
    'id'
  ];

  if (ignores) {
    ignore = ignore.concat(ignores);
  }

  if (state.type === 'main_personality') {
    ignore = ignore.concat([
      // 'style',
      'endurance'
    ]);
  }

  if (state.type === 'mastery' || state.type === 'dragonball') {
    ignore = ignore.concat([
      'personality',
      'pur',
      'level',
      'stages',
      'endurance'
    ]);
  }

  if (state.type === 'ally') {
    ignore = ignore.concat([
      'endurance'
    ]);
  }

  if (state.type === 'physical_combat' || state.type === 'energy_combat' || state.type === 'setup' || state.type === 'drill' || state.type === 'event') {
    ignore = ignore.concat([
      'pur',
      'level',
      'stages'
    ]);
  }

  return reduce(state, function formSet(acc, val, key) {
    if (ignore.includes(key)) {
      return acc;
    }

    if (key === 'image_file') {
      acc.set(key, val);
      return acc;
    }

    if (typeof val === 'object') {
      return reduce(val, function(acc2, val2, key2){
        acc2.set(`${key}[${key2}]`, val2);
        return acc2;
      }, acc);
    }
    console.log(key, val);
    acc.set(key, val);

    return acc;
  }, new FormData());
}

function createCard() {

  var state = store.getState();

  var body = buildBody(state, ['_rev']);

  for(var pair of body.entries()) {
    console.log(pair[0]+ ', '+ pair[1]);
  }

  var _id;

  fetch(`http://localhost:8080/cards`, {
    method: 'post',
    body: body
  })
  .then(function(response) {
    console.log('success', response);
    return response.json();
  })
  .then(function(info) {
    // TODO: don't store like this
    _id = info.id;
    return getCards();
  })
  .then(function(cards) {
    update(cards);
    return cards.find(function(card) {
      return card._id === _id;
    })
  })
  .then(function(card) {
    console.log(card);
    story.replace({ pathname: `/${card._id}`, state: card });
  })
  .catch(function(err) {
    console.log('error', err);
  });
}

function updateCard() {

  var state = store.getState();

  var body = buildBody(state, ['image_file']);

  for(var pair of body.entries()) {
    console.log(pair[0]+ ', '+ pair[1]);
  }

  var _id;

  fetch(`http://localhost:8080/cards/${state._id}`, {
    method: 'put',
    body: body
  })
  .then(function(response) {
    console.log('success', response);
    return response.json();
  })
  .then(function(info) {
    // TODO: don't store like this
    _id = info.id;
    return getCards();
  })
  .then(function(cards) {
    update(cards);
    return cards.find(function(card) {
      return card._id === _id;
    })
  })
  .then(function(card) {
    console.log(card);
    story.replace({ pathname: `/${card._id}`, state: card });
  })
  .catch(function(err) {
    console.log('error', err);
  });
}

var styleOptions = [
  'black',
  'blue',
  'red',
  'saiyan',
  'namekian',
  'orange',
  'non-styled'
];

// function checkboxView(id, label, value) {
//   return [
//     yo`<label for="${id}">${label}</label>`,
//     yo`<input type="checkbox" id="${id}" name="${id}" checked=${value} value="true" />`
//   ];
// }

function StatefulInput(label, key) {
  var state = store.getState();

  var props = {
    id: key,
    label: label,
    value: state[key],
    onInput: function(evt) {
      var payload = set({}, key, evt.target.value);

      store.dispatch({ type: `update_${key}`, payload: payload });
    }
  };

  return Input(props);
}

function StatefulTextarea(label, key) {
  var state = store.getState();

  var props = {
    id: key,
    label: label,
    value: state[key],
    onInput: function(evt) {
      var payload = set({}, key, evt.target.value);

      store.dispatch({ type: `update_${key}`, payload: payload });
    }
  };

  return Textarea(props);
}

function StatefulCheckbox(label, key) {
  var state = store.getState();

  var path = key.split('.');

  var props = {
    id: key,
    label: label,
    checked: get(state, key),
    onChange: function(evt) {
      var payload = set({}, path[1], evt.target.checked);

      store.dispatch({ type: `update_${path[0]}`, payload: payload });
    }
  };

  return Checkbox(props);
}

function StatefulSelect(label, key, options) {
  var state = store.getState();

  var props = {
    id: key,
    label: label,
    value: state[key],
    options: options,
    onChange: function(evt) {
      var payload = set({}, key, evt.target.value);

      store.dispatch({ type: `update_${key}`, payload: payload });
    }
  }

  return Select(props);
}

function formView() {
  var state = store.getState();
  console.log(state);

  var personalityFields;
  if (state.type === 'main_personality' || state.type === 'ally') {
    personalityFields = [
      StatefulCheckbox('Saiyan Heritage?', 'heritage.saiyan'),
      StatefulCheckbox('Namekian Heritage?', 'heritage.namekian'),
      StatefulInput('PUR', 'pur'),
      StatefulInput('Level', 'level'),
      stagesView()
    ];
  }

  var styledFields;
  if (state.type === 'physical_combat' || state.type === 'energy_combat' || state.type === 'event' || state.type === 'setup' || state.type === 'drill') {
    styledFields = [
      StatefulCheckbox('Has Endurance?', 'has.endurance'),
      StatefulInput('Endurance', 'endurance'),
      StatefulCheckbox('Is Attachable?', 'has.attach'),
      StatefulCheckbox('Is BAU?', 'has.banish_after_use')
    ];
  }

  var conditionals = [
    StatefulCheckbox('Is Named?', 'considered.named'),
    StatefulCheckbox('Is Styled?', 'considered.styled'),
    StatefulCheckbox('Is Attack?', 'is.attack'),
    StatefulCheckbox('Is Block?', 'is.block'),
    StatefulCheckbox('Is Prevention?', 'is.prevention'),
    StatefulCheckbox('Is Instant?', 'is.instant'),
    StatefulCheckbox('Is Constant?', 'is.constant'),
    StatefulCheckbox('Disables MPPV?', 'disables.mppv'),
    StatefulCheckbox('Has HIT Effect?', 'has.hit'),
    StatefulCheckbox('Causes Shuffle?', 'has.shuffle'),
    StatefulCheckbox('Has Discard Removal?', 'has.discard_removal'),
    StatefulCheckbox('Has "When Entering Combat"?', 'has.when_entering'),
    StatefulCheckbox('Has Search Effect?', 'has.search'),
    StatefulCheckbox('Has Draw?', 'has.draw'),
    StatefulCheckbox('Has anger raise?', 'has.anger_raise'),
    StatefulCheckbox('Has anger lower?', 'has.anger_lower')
  ];

  var defaults = [
    StatefulInput('Card Number', 'card_number'),
    StatefulInput('Rarity Number', 'rarity_number'),
    StatefulSelect('Rarity', 'rarity', rarityOptions),
    StatefulInput('Set Number', 'set_number'),
    StatefulSelect('Set Name', 'set', setNameOptions),
    StatefulInput('Title', 'title'),
    StatefulInput('Card Image', 'image'),
    StatefulSelect('Type', 'type', cardTypeOptions),
    StatefulTextarea('Ability', 'ability'),
    StatefulInput('Limit', 'limit'),
    StatefulSelect('Alignment', 'alignment', alignmentOptions),
    StatefulSelect('Style', 'style', styleOptions),
    StatefulInput('Personality', 'personality'),
  ];

  var image;
  if (state.image_file) {
    var src = window.URL.createObjectURL(state.image_file);
    image = yo`<img className="${classes.cardImage}" src="${src}" />`;
  } else if (state.image) {
    image = yo`<img className="${classes.cardImage}" src="http://localhost:8080${state.image}" />`;
  } else {
    image = yo`<input type="file" onchange=${uploadImage} />`;
  }

  return yo`
    <div className="${classes.formContainer}">
      ${image}
      <div className="${classes.form}">
        <form id="edit-card" onsubmit=${send}>
          ${defaults}
          ${conditionals}
          ${styledFields}
          ${personalityFields}
          <button>Update</button>
        </form>
      </div>
    </div>
  `;
}

function uploadImage(evt) {
  var file = evt.target.files[0];
  // console.log(file);

  store.dispatch({ type: 'update_image_file', payload: file });
}

story.listen(function(location) {
  // console.log('location change', location);

  var card = location.state;

  if (card) {
    store.dispatch({ type: 'load_form', payload: card });
  } else {
    store.dispatch({ type: 'reset_form' });
  }
});

store.subscribe(updateForm);

function listItemView(card) {
  function handler(evt) {
    evt.preventDefault();

    story.push({
      pathname: `/${card._id}`,
      state: card
    });
  }
  var href = story.createHref(`/${card._id}`);

  // console.log(card);

  return yo`
    <li><a href="${href}" onclick=${handler}>${card.card_name || card.title}</a></li>
  `
}

function addNewListItem() {
  function handler(evt) {
    evt.preventDefault();

    story.push({
      pathname: '/new'
    });
  }

  var href = story.createHref('/new');

  return yo`
    <li><a href="${href}" onclick=${handler}>Add new card</a></li>
  `;
}

function container(cards) {
  var list = cards.map(listItemView);
  return yo`
    <div className="${classes.container}">
      <ul className="${classes.list}">
        ${addNewListItem()}
        ${list}
      </ul>
      <div className="${classes.formContainer}"></div>
    </div>
  `;
}


var el = document.createElement('div');

function update(cards) {
  yo.update(el, container(cards));
}

document.body.appendChild(el);

function getCards() {
  return fetch('http://localhost:8080/cards')
    .then(function(response) {
      return response.json();
    }).then(function(cards) {
      // return cards.filter((card) => card.personality === 'trunks');
      // return cards.filter((card) => card.color === 'saiyan' || card.style === 'saiyan');
      // return cards.filter((card) => card.color === 'freestyle' || card.style === 'non-styled' && card.type !== 'dragonball' && card.type !== 'ally' && !(card.considered && card.considered.named));
      // return cards.filter((card) => card.type !== 'main_personality' && card.type !== 'ally' && card.type !== 'dragonball' && card.type !== 'mastery' && card.personality != null)
      // return cards.filter((card) => card.type === 'ally');
      return cards.filter((card) => card.type === 'mastery');
      // return cards.filter((card) => card.type === 'main_personality');
    });
}

getCards()
  .then(function(cards){
    // console.log(cards);
    update(cards);

    var location = story.getCurrentLocation();
    console.log(location);
    if (location && location.state) {
      var card = location.state;
      store.dispatch({ type: 'load_form', payload: card });
    } else if (location && location.pathname === '/new') {
      store.dispatch({ type: 'reset_form' });
    }
  });