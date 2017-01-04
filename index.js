'use strict';

var _ = require('lodash');
var yo = require('yo-yo');

var classes = require('./classes');

var redux = require('redux');
var createActorMiddleware = require('redux-pull-actors');
var pull = require('pull-stream');
var prom = require('pull-promise');

var sift = require('sift');
var groupBy = require('group-array');
var reduce = require('object.reduce');

var history = require('history');
var jwt = require('jsonwebtoken');
var story = history.useQueries(history.createHistory)();

var fork = require('./fork');

var reducers = redux.combineReducers({
  cards: function(state, action) {
    state = state || [];

    switch(action.type) {
      case 'data_loaded':
        return action.payload.map((card) => Object.assign({}, card, {
          expanded: false,
          image: `http://${window.location.hostname}:8080${card.image}`,
          thumbnail: `http://${window.location.hostname}:8080${card.image}`.replace('/images/', '/thumbnails/')
        }));
      default:
        return state;
    }
  },
  deck: function(state, action) {
    state = state || {};

    var count;
    var update = {};

    switch(action.type) {
      case 'add_to_deck': {
        count = (state[action.payload.id] || 0) + 1;
        update[action.payload.id] = count;
        return Object.assign({}, state, update);
      }
      case 'remove_from_deck': {
        count = (state[action.payload.id] || 0) - 1;
        if (count < 0) {
          count = 0;
        }
        update[action.payload.id] = count;
        var result = Object.assign({}, state, update);
        if (count === 0) {
          delete result[action.payload.id];
        }
        return result;
      }
      case 'load_deck': {
        return action.payload;
      }
      default:
        return state;
    }
  },
  phase: function(state, action) {
    state = state || 'mp';

    switch(action.type) {
      case 'update_phase':
        return action.payload;
      default:
        return state;
    }
  },
  filters: function(state, action) {
    state = state || [];

    switch(action.type) {
      case 'add_filters':
        return _.unionWith(state, action.payload, _.isEqual);
      case 'remove_filters':
        return _.differenceWith(state, action.payload, _.isEqual);
      case 'replace_filters':
        return [].concat(action.payload);
      default:
        return state;
    }
  },
  // Phase filters
  mpFilters: function(state, action) {
    state = state || [ { type: 'main_personality' } ];

     switch(action.type) {
      case 'add_mp_filters':
        return _.unionWith(state, action.payload, _.isEqual);
      case 'remove_mp_filters':
        return _.differenceWith(state, action.payload, _.isEqual);
      case 'replace_mp_filters':
        return [].concat(action.payload);
      default:
        return state;
    }
  },
  masteryFilters: function(state, action) {
    state = state || [ { type: 'mastery' } ];

     switch(action.type) {
      case 'add_mastery_filters':
        return _.unionWith(state, action.payload, _.isEqual);
      case 'remove_mastery_filters':
        return _.differenceWith(state, action.payload, _.isEqual);
      case 'replace_mastery_filters':
        return [].concat(action.payload);
      default:
        return state;
    }
  },
  cardFilters: function(state, action) {
    state = state || [ { type: { $or: [
      'physical_combat', 'energy_combat', 'event', 'ally', 'dragonball', 'setup', 'drill',
      // holdovers
      'physical combat', 'energy combat'
      ] } } ];

     switch(action.type) {
      case 'add_card_filters':
        return _.unionWith(state, action.payload, _.isEqual);
      case 'remove_card_filters':
        return _.differenceWith(state, action.payload, _.isEqual);
      case 'replace_card_filters':
        return [].concat(action.payload);
      default:
        return state;
    }
  }
});

function personalityFilter() {
  return pull(
    pull.filter(function(incoming) {
      var card = incoming.action.payload;
      return (incoming.action.type === 'add_to_deck' && card.type === 'main_personality');
    }),
    pull.map(function(incoming) {
      var card = incoming.action.payload;
      var alignment = card.alignment;
      var personality = card.personality;
      var level = card.level;
      var id = card.id;
      return [
        {
          type: 'add_filters',
          payload: [
            // { personality: { $or: [personality, { $exists: false }] } },
            { $or: [ { alignment: alignment }, { alignment: 'neutral' } ] }
          ]
        },
        {
          type: 'add_mp_filters',
          payload: [
            { type: 'main_personality', personality: personality },
            { $or: [ { id: id }, { level: { $ne: level } } ] }
          ]
        },
        {
          type: 'add_card_filters',
          payload: [
            { $or: [
              { type: 'ally', personality: { $not: personality } },
              { type: { $not: 'ally' }, personality: { $or: [personality, { $exists: false }] } }
            ] }
          ]
        }
      ];
    }),
    pull.flatten()
  );
}

function masteryFilter() {
  return pull(
    pull.filter(function(incoming) {
      var card = incoming.action.payload;

      if (incoming.action.type !== 'add_to_deck' || card.type !== 'main_personality') {
        return false;
      }

      var deck = incoming.state.deck;

      var levels = _.reduce(deck, function(acc, val, key) {
        var card = _.find(incoming.state.cards, { id: key })
        if (card.type === 'main_personality') {
          return acc.concat(card.level);
        }

        return acc;
      }, []);

      return (levels.includes(1) && levels.includes(2) && levels.includes(3) && levels.includes(4));
    }),
    pull.map(function(incoming) {

      var card = incoming.action.payload;

      var styles = ['orange', 'black', 'blue', 'red'];

      if (card.heritage.saiyan) {
        styles.push('saiyan');
      }

      if (card.heritage.namekian) {
        styles.push('namekian');
      }

      return [
        {
          type: 'add_mastery_filters',
          payload: [
            { style: { $or: styles } }
          ]
        },
        {
          type: 'update_phase',
          payload: 'mastery'
        }
      ];
    }),
    pull.flatten()
  );
}

function cardsFilter() {
  return pull(
    pull.filter(function(incoming) {
      return incoming.action.type === 'add_to_deck';
    }),
    pull.map(function(incoming) {
      var card = incoming.action.payload;
      if (card.type === 'mastery') {
        return [
          {
            type: 'update_phase',
            payload: 'cards'
          },
          {
            type: 'add_card_filters',
            payload: [
              // TODO: make "style"
              { $or: [
                { color: card.style },
                { style: { $or: [card.style, 'non-styled'] } }
              ] }
            ]
          }
        ];
      }
    }),
    pull.flatten()
  );
}

function initFilter() {
  return pull(
    pull.filter(function(incoming) {
      return incoming.action.type === 'data_loaded';
    }),
    pull.map(function() {
      return {
        type: 'update_phase',
        payload: 'mp'
      }
    })
  );
}

var actors = createActorMiddleware({
  log: function() {
    return pull.map(console.log.bind(console));
  },
  capture: function() {
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'add_to_deck' || incoming.action.type === 'remove_from_deck';
      }),
      pull.map(function(incoming) {
        // TODO: JWTs grow way too fast, need something else
        var hash = jwt.sign(incoming.state.deck, 'test', { noTimestamp: true });
        story.replace({ query: { deck: hash } });
      })
    );
  },
  loadCapture: function() {
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'load_capture';
      }),
      pull.map(function(incoming) {
        var deck = jwt.verify(incoming.action.payload, 'test');
        return {
          type: 'load_deck',
          payload: deck
        };
      })
    );
  },
  loadData: function() {
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'load_data';
      }),
      prom.through(function(incoming) {
        return fetch(incoming.action.payload)
          .then(function(response) {
            return response.json();
          })
          .then(function(result) {
            return { type: 'data_loaded', payload: result };
          });
      })
    );
  },
  addToDeck: function() {
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'attempt_add_to_deck';
      }),
      pull.map(function(incoming) {
        var card = incoming.action.payload;
        var deck = incoming.state.deck;
        var used = deck[card.id] || 0;
        if (used < card.limit) {
          return {
            type: 'add_to_deck',
            payload: card
          };
        }
      })
    );
  },
  removeFromDeck: function() {
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'attempt_remove_from_deck';
      }),
      pull.map(function(incoming) {
        var card = incoming.action.payload;
        var deck = incoming.state.deck;
        var used = deck[card.id] || 0;
        if (used > 0) {
          return {
            type: 'remove_from_deck',
            payload: card
          };
        }
      })
    );
  },
  applyFilter: function() {
    return fork([
      personalityFilter(),
      initFilter(),
      masteryFilter(),
      cardsFilter()
    ]);
  },
  removeFilter: function() {
    // TODO: switch to the earliest uncompleted phase
    return pull(
      pull.filter(function(incoming) {
        return incoming.action.type === 'remove_from_deck';
      }),
      pull.map(function(incoming) {
        var card = incoming.action.payload;
        if (card.type === 'main_personality') {
          var alignment = card.alignment;
          var personality = card.personality;
          var level = card.level;
          var id = card.id;

          var personalityRemain = _.some(incoming.state.deck, { personality: personality });
          var alignmentRemain = _.some(incoming.state.deck, { alignment: alignment });

          var filters = [];
          if (!personalityRemain) {
            filters.push({ personality: personality });
          }

          if (!alignmentRemain) {
            filters.push({ alignment: alignment });
          }

          var mpFilters = [
            { $or: [ { id: id }, { level: { $ne: level } } ] }
          ];

          return [
            {
              type: 'update_phase',
              payload: 'mp'
            },
            {
              type: 'remove_filters',
              payload: filters
            },
            {
              type: 'remove_mp_filters',
              payload: mpFilters
            }
          ];
        }

        if (card.type === 'mastery') {
          return [
            {
              type: 'update_phase',
              payload: 'mastery'
            }
          ]
        }
      }),
      pull.flatten()
    );
  }
});
var middleware = redux.applyMiddleware(actors)
var store = redux.createStore(reducers, middleware);

function filter(cards, filters) {
  return sift({ $and: filters }, cards);
}

function flatten(grouped) {
  return reduce(grouped, function(result, arr) {
    return result.concat(arr);
  }, []);
}

// TODO: specific to MPs
function groupMPs(cards) {
  var grouped = groupBy(cards, 'personality');
  return flatten(grouped);
}

function groupMasteries(cards) {
  var grouped = groupBy(cards, 'style');
  return flatten(grouped);
}

function groupTypes(cards) {
  var grouped = groupBy(cards, 'type');
  return flatten(grouped);
}

function cardListView() {
  var state = store.getState();
  // var cardList = state.cards.filter(applyFilters(state.filters)).map(cardView);
  var filters = state.filters;
  if (state.phase === 'mp') {
    filters = filters.concat(state.mpFilters);
  }

  if (state.phase === 'mastery') {
    filters = filters.concat(state.masteryFilters);
  }

  if (state.phase === 'cards') {
    filters = filters.concat(state.cardFilters);
  }

  var cardList = filter(state.cards, filters);

  var cards;
  if (state.phase === 'mp') {
    cards = groupMPs(cardList).map(cardView);
  }

  if (state.phase === 'mastery') {
    cards = groupMasteries(cardList).map(cardView);
  }

  if (state.phase === 'cards') {
    cards = groupTypes(cardList).map(cardView);
  }

  return yo`<div id="card-list-pane" className="${classes.pane}">
    ${cards}
  </div>`;
}

function groupDeck(state) {
  var grouped = _.reduce(state.deck, function(result, count, id) {
    var card = _.find(state.cards, { id: id });
    var group = result[card.type];
    group = (group || []).concat(card);
    result[card.type] = group;
    return result;
  }, {});

  return grouped;
}

var headers = {
  main_personality: 'Main Personality',
  mastery: 'Mastery',
  physical_combat: 'Physical Combats',
  energy_combat: 'Energy Combats',
  setup: 'Setups',
  ally: 'Allies',
  drill: 'Drills',
  dragonball: 'Dragon Balls',
  event: 'Events'
};

var typeSortOrder = {
  main_personality: 0,
  mastery: 1,
  ally: 2,
  dragonball: 3,
  physical_combat: 4,
  energy_combat: 5,
  event: 6,
  setup: 7,
  dril: 8
};

function deckListView() {
  var state = store.getState();
  var grouped = groupDeck(state);
  var deckList = [];
  var types = _.sortBy(Object.keys(grouped), function(type) {
    return typeSortOrder[type];
  });

  types.forEach(function(type) {
    var count = 0;
    var cards = grouped[type].map(function(card) {
      count += state.deck[card.id];
      return cardView(card);
    });

    if (type === 'main_personality' || type === 'mastery') {
      deckList.push(yo`<div className="${classes.listItemHeader}">${headers[type]}</div>`);
    } else {
      deckList.push(yo`<div className="${classes.listItemHeader}">${headers[type]} (${count})</div>`);
    }
    deckList = deckList.concat(cards);
  });

  return yo`<div id="deck-list-pane" className="${classes.pane}">
    ${deckList}
  </div>`;
}

function paneContainerView() {
  return yo`<div className="pane-container">
    ${cardListView()}
    ${deckListView()}
  </div>`;
}

function dotbarView(paneCount, selected) {
  var dots = [];
  for (var x = 0; x < paneCount; x++) {
    var dot;
    if (x === selected) {
      dot = yo`<span className="dot-selected"></span>`;
    } else {
      dot = yo`<span></span>`;
    }
    dot.innerHTML = '&middot;';
    dots.push(dot);
  }
  var dotbar = yo`<div className="dotbar">
    ${dots}
  </div>`;

  return dotbar;
}

var tabs = [
  'Card List',
  'Deck List',
  // 'Statistics'
];

function navbarView(idx) {
  idx = idx || 0;

  var tabTitle = tabs[idx];

  return yo`
    <nav className="navbar">
      <div>${tabTitle}</div>
      ${dotbarView(tabs.length, idx)}
    </nav>
  `;
}

function enduranceView(card) {
  if (!card.endurance) {
    return;
  }

  return yo`<div className="${classes.cardDetailLine}">Endurance: ${card.endurance}</div>`;
}

function levelView(card) {
  if (!card.level) {
    return;
  }

  return yo`<div className="${classes.cardDetailLine}">Level: ${card.level}</div>`;
}

function purView(card) {
  if (!card.pur) {
    return;
  }

  return yo`<div className="${classes.cardDetailLine}">PUR: ${card.pur}</div>`;
}

function moreDetailsView(card) {
  if (!card.expanded) {
    return;
  }

  return yo`
    <div className="${classes.moreDetails}">
      ${enduranceView(card)}
      ${levelView(card)}
      ${purView(card)}
      <div className="${classes.cardDetailLine}">${card.type}</div>
      <div className="${classes.cardDetailLine}">${card.ability}</div>
    </div>
  `;
}

// function count(deck, id) {
//   return _.reduce(deck, function(count, card) {
//     if (card.id === id) {
//       return count + 1;
//     } else {
//       return count;
//     }
//   }, 0);
// }

function cardView(card) {
  var state = store.getState();
  var used = state.deck[card.id] || 0;
  var free = (card.limit - used);
  var changeButton;
  if (free) {
    changeButton = yo`
      <button className="${classes.addToDeckButton}" onclick=${eventHandler('attempt_add_to_deck', card)}>
        <span className="${classes.visuallyhidden}">Add To Deck</span>
      </button>
    `;
  } else {
    changeButton = yo`
      <button className="${classes.removeFromDeckButton}" onclick=${eventHandler('attempt_remove_from_deck', card)}>
        <span className="${classes.visuallyhidden}">Remove From Deck</span>
      </button>
    `;
  }

  return yo`
    <div id=${card.id} className=${classes.listItem}>
      <img className="${classes.cardThumbnail}" src="${card.thumbnail || card.image}" />
      <div className="${classes.cardDetails}" onclick=${toggleExpanded.bind(null, card)}>
        <div className="${classes.cardTitle}">${card.title}</div>
        ${moreDetailsView(card)}
        <div className="${classes.cardCounts}">
          <div>Limit: ${card.limit}</div>
          <div>Used: ${used}</div>
          <div>Free: ${card.limit - used}</div>
        </div>
      </div>
      ${changeButton}
    </div>
  `;
}

function eventHandler(type, payload) {
  return function() {
    store.dispatch({ type: type, payload: payload });
  }
}

function toggleExpanded(card) {
  card.expanded = !card.expanded;

  updatePanes();
}

function updatePanes() {
  var cardListPaneEl = document.querySelector('#card-list-pane');
  var deckListPaneEl = document.querySelector('#deck-list-pane');

  yo.update(cardListPaneEl, cardListView());
  yo.update(deckListPaneEl, deckListView());
}

var paneContainerEl = document.querySelector('.pane-container');
yo.update(paneContainerEl, paneContainerView());

function updateNavbar(idx) {
  var navbarEl = document.querySelector('.navbar');

  yo.update(navbarEl, navbarView(idx));
}

var attach = require('./tabs');
var tabEE = attach(paneContainerEl);

tabEE.on('tab-shown', updateNavbar);

store.dispatch({ type: 'load_data', payload: `http://${window.location.hostname}:8080/cards` });

var loc = story.getCurrentLocation();
if (loc.query && loc.query.deck) {
  store.dispatch({ type: 'load_capture', payload: loc.query.deck });
}

var renderRequested = false;

store.subscribe(function() {
  if (renderRequested) {
    return;
  }

  renderRequested = true;
  requestAnimationFrame(function() {
    updatePanes();
    renderRequested = false;
  });
  // updatePanes();
});

window.store = store;