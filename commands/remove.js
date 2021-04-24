const Meditations = require('../databaseFiles/connect').Meditations;
const Prefixes = require('../databaseFiles/connect').Prefixes;
const { ObjectId } = require('mongodb');

module.exports.execute = async (client, message, args) => {
  let prefix;
  try {
    prefix = await Prefixes.findOne({'guild': message.guild.id});
    prefix = prefix.prefix;
  } catch {
    prefix = '.';
  }

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
  aliases: [],
  module: 'Meditation',
  description: `Deletes a meditation session by ID. Use the \`rank\` command to see your recent meditations as well as their IDs.`,
  usage: ['remove <meditation ID>'],
};
