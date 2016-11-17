'use strict';

module.exports = {
  card_number: require('./card_number'),
  rarity_number: require('./rarity_number'),
  rarity: require('./rarity'),
  set_number: require('./set_number'),
  set: require('./set'),
  title: require('./title'),
  limit: require('./limit'),
  type: require('./type'),
  ability: require('./ability'),
  alignment: require('./alignment'),
  style: require('./style'),
  personality: require('./personality'),
  pur: require('./pur'),
  level: require('./level'),
  stages: require('./stages'),
  has: require('./has'),
  is: require('./is'),
  disables: require('./disables'),
  // Hidden fields
  image: require('./image'),
  image_file: require('./image_file'),
  _rev: require('./_rev'),
  _id: require('./_id'),
  // Calculated fields
  id: require('./id')
};