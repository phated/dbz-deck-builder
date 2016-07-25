'use strict';

var yo = require('yo-yo');
var diff = require('diffhtml');
var html = diff.html;
var csjs = require('csjs-inject');

var cards = [
  {
    title: 'Blue Head Knock',
    image: 'c27_blue_head_knock.jpg',
    limit: 3,
    type: 'Physical Combat',
    text: `Physical Attack. Lower your opponent's anger to 0. DAMAGE: 5 life cards.`,
    endurance: 2
  },
  {
    title: 'Captain Ginyu, Leader',
    image: 'c6_captain_ginyu_leader.jpg',
    limit: 3,
    type: 'Main Personality',
    text: `POWER: Energy attack costing 3 stages. DAMAGE: 4 life cards. Search your Life Deck for an Ally and place it into play at 4 power stages above 0. HIT: Choose one of your Allies in play, that Ally can make actions regardless of your MP's power stage this combat.`,
    level: 1,
    pur: 2
  }
];

var model = [];

for (var x = 0; x < 100; x++) {
  model.push(Object.assign({}, cards[x % 2], {
    id: x,
    expanded: false
  }));
}

var black = '#303030';
var gray = '#808080';
var lightgray = '#d3d3d3';

var classes = csjs`
  body {
    display: block;
    margin: 0 8px;
    padding-top: 45px;
  }

  .navbar {
    box-sizing: border-box;
    padding: 10px 8px;
    background: ${black};
    height: 45px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: 0 -10px 10px 10px ${gray};
    color: #fff;
    font-size: 20px;
    line-height: 25px;
    display: flex;
  }

  .listItem {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    min-height: 70px;
    border-bottom: 1px solid ${lightgray};
  }

  .cardThumbnail {
    border-radius: 3px;
    max-width: 100%;
    max-height: 53px;
  }

  .cardDetails {
    padding: 0 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    transition: max-height 2s;
  }

  .moreDetails {}

  .cardTitle {
    flex-grow: 1;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .cardType {
    margin-bottom: 5px;
  }

  .cardText {
    margin-bottom: 10px;
  }

  .cardCounts {
    display: flex;
    justify-content: space-between;
  }

  .addToDeckButton {
    background-color: transparent;
    background-image: url(https://rawgit.com/driftyco/ionicons/master/src/plus-round.svg);
    background-repeat: no-repeat;
    background-size: 50% 50%;
    background-position: center;
    border: 0;
    border-left: 1px solid ${lightgray};
    width: 50px;
    outline: none;
    flex-shrink: 0;
  }

  .deckInfo {
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 10px;
    background: ${black};
    color: #fff;
    border-top-right-radius: 10px;
    // box-shadow: 0 10px 10px 10px ${gray};
  }

  /* From h5bp */
  .visuallyhidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }
`;

function container() {
  var els = model.map((card) => cardView(card));

  return html`<div>
    <nav className="${classes.navbar}">Deck Builder</nav>
    <div>
      <div className="${classes.deckInfo}">Deck Count: 42</div>
      ${els}
    </div>
  </div>`;
}

function cardView(card) {
  var moreDetailsEl;
  if (card.expanded) {
    moreDetailsEl = html`
      <div className="${classes.moreDetails}">
        <div className="${classes.cardType}">${card.type}</div>
        <div className="${classes.cardText}">${card.text}</div>
      </div>
    `;
  }

  return html`
    <div className=${classes.listItem}>
      <img className="${classes.cardThumbnail}" src="${card.image}">
      <div className="${classes.cardDetails}" onclick=${toggleExpanded.bind(null, card)}>
        <div className="${classes.cardTitle}">${card.title}</div>
        ${moreDetailsEl}
        <div className="${classes.cardCounts}">
          <div>Limit: ${card.limit}</div>
          <div>Used: 2</div>
          <div>Free: 1</div>
        </div>
      </div>
      <button className="${classes.addToDeckButton}" onclick=${onClick}>
        <span className="${classes.visuallyhidden}">Add To Deck</span>
      </button>
    </div>
  `;
}

function onClick() {
  console.log('add to deck');
}

function toggleExpanded(card) {
  card.expanded = !card.expanded;

  update();
}

// var el = container();

var el = document.createElement('div');

function update() {
  diff.outerHTML(el, container());
}

document.body.appendChild(el);
update();
