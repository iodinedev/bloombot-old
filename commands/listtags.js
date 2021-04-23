const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');
const Discord = require('discord.js');

module.exports.execute = async (client, message) => {
  
};

module.exports.config = {
  name: 'hello',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};
