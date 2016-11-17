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

var fork = require('./fork');

var reducers = redux.combineReducers({
  cards: function(state, action) {
    state = state || [];

    switch(action.type) {
      case 'data_loaded':
        return action.payload.map((card) => Object.assign({}, card, {
          expanded: false,
          // type_display: 'Main Personality',
          image: `http://${window.location.hostname}:8080${card.image}`
        }));
      default:
        return state;
    }
  },
  deck: function(state, action) {
    state = state || [];

    switch(action.type) {
      case 'add_to_deck': {
        return state.concat(action.payload);
      }
      case 'remove_from_deck': {
        return state.filter((card) => card.id !== action.payload.id);
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
      return {
        type: 'add_filters',
        payload: [
          { $or: [ { id: id }, { level: { $ne: level } } ] },
          { personality: { $or: [personality, { $exists: false }] } },
          { $or: [ { alignment: alignment }, { alignment: 'neutral' } ] }
        ]
      };
    })
  );
}

function masteryFilter() {
  return pull(
    pull.filter(function(incoming) {
      return incoming.action.type === 'add_to_deck';
    }),
    pull.map(function(incoming) {
      var deck = incoming.state.deck;
      var personality;

      var levels = deck.reduce(function(acc, val) {
        if (val.type === 'main_personality') {
          // TODO: avoid mutation
          personality = val.personality;
          return acc.concat(val.level);
        }

        return acc;
      }, []);

      var filtersToRemove = deck.reduce(function(acc, val) {
        if (val.type === 'main_personality') {
          return acc.concat({ $or: [ { id: val.id }, { level: { $ne: val.level } } ] });
        }

        return acc;
      }, []);

      if (levels.includes(1) && levels.includes(2) && levels.includes(3) && levels.includes(4)) {
        return [
          {
            type: 'update_phase',
            payload: 'mastery'
          },
          {
            type: 'add_filters',
            payload: [
              { type: 'mastery' }
            ]
          },
          {
            type: 'remove_filters',
            payload: [
              { type: 'main_personality' },
              { personality: personality }
            ].concat(filtersToRemove)
          }
        ];
      }
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
            type: 'add_filters',
            payload: [
              { type: { $or: ['physical_combat', 'energy_combat', 'event', 'ally', 'dragonball', 'setup', 'drill'] } },
              // TODO: make "style"
              // { style: ''}
              { color: { $or: [card.style, 'freestyle'] } }
            ]
          },
          {
            type: 'remove_filters',
            payload: [
              { type: 'mastery' }
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
        type: 'add_filters',
        payload: [
          { type: 'main_personality' }
        ]
      }
    })
  );
}

var actors = createActorMiddleware({
  log: function() {
    return pull.map(console.log.bind(console));
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
        var used = count(deck, card.id);
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
        var used = count(deck, card.id);
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
    // TODO: switch phase when a personality or mastery is removed
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

          var filters = [
            { $or: [ { id: id }, { level: { $ne: level } } ] },
          ]

          if (!personalityRemain) {
            filters.push({ personality: personality });
          }

          if (!alignmentRemain) {
            filters.push({ alignment: alignment });
          }

          return {
            type: 'remove_filters',
            payload: filters
          };
        }
      })
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

function cardListView() {
  var state = store.getState();
  // var cardList = state.cards.filter(applyFilters(state.filters)).map(cardView);
  var cardList = filter(state.cards, state.filters);

  var cards;
  if (state.phase === 'mp') {
    cards = groupMPs(cardList).map(cardView);
  }

  if (state.phase === 'mastery') {
    cards = groupMasteries(cardList).map(cardView);
  }

  if (state.phase === 'cards') {
    cards = cardList.map(cardView);
  }

  return yo`<div id="card-list-pane" className="${classes.pane}">
    ${cards}
  </div>`;
}

function deckListView() {
  var state = store.getState();
  var deckList = state.deck.map(cardView);

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

function count(deck, id) {
  return _.reduce(deck, function(count, card) {
    if (card.id === id) {
      return count + 1;
    } else {
      return count;
    }
  }, 0);
}

function cardView(card) {
  var state = store.getState();
  var used = count(state.deck, card.id);
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
      <img className="${classes.cardThumbnail}" src="${card.image}" />
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