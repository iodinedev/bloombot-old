const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');
const Discord = require('discord.js');

module.exports.execute = async (client, message) => {
  return await message.channel.send('Under construction...');
  
};

module.exports.config = {
  name: 'listtags',
  aliases: ['tags'],
  module: 'Utility',
  description: 'Shows a list of all tags available',
  usage: ['listtags'],
};
