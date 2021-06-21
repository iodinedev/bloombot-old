const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a tag!');

  const tag = await Tags.deleteOne({
    tag: args[0]
  });

  if (tag) {
		return await message.channel.send(':white_check_mark: Term deleted.')
  }

  return await message.channel.send(':x: Tag not found!');
};

module.exports.config = {
  name: 'removeterm',
  aliases: ['destroyitcastitintothefire', 'deleteterm'],
  module: 'Admin',
  description: 'Removes a term from the glossary.',
  usage: ['removeterm <term>'],
  admin: true,
};
