'use strict';

var rarities = {
  1: 'Common',
  2: 'Promo',
  3: 'Uncommon',
  4: 'Starter',
  5: 'Rare',
  6: 'Ultra Rare',
  7: 'Dragon Rare'
};

var setNames = {
  set1: 'Premiere',
  set2: 'Heroes & Villains',
  set3: 'Movie Collection',
  set4: 'Evolution',
  set5: 'Perfection',
  set6: 'Vengeance',
  set7: 'Awakening'
};

var typeTranslations = {
  ally: 'ally',
  'physical combat': 'physical_combat',
  'energy combat': 'energy_combat',
  mainpersonality: 'main_personality',
  setup: 'setup',
  drill: 'drill',
  dragonball: 'dragonball',
  event: 'event',
  mastery: 'mastery'
};

module.exports = {
  rarities: rarities,
  setNames: setNames,
  typeTranslations: typeTranslations
};