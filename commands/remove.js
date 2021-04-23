const Meditations = require('../databaseFiles/connect').Meditations;
const prefix = require('../config.json').prefix;
const { ObjectId } = require('mongodb');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(`:x: You must include a meditation ID to remove. Use \`${prefix}rank\` to see your recent meditations' IDs.`)
  const id = ObjectId(args[0]);

  var meditation = await Meditations.findOne({
    _id: id
  });

  if (meditation.usr !== message.author.id) return await message.channel.send(':x: You cannot delete someone else\'s meditations.');

  await Meditations.deleteOne({
    _id: id
  });


  return await message.channel.send(':white_check_mark: Meditation entry has been removed.');
};

module.exports.config = {
  name: 'remove',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};
