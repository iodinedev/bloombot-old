const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Meditations = require('../databaseFiles/connect').Meditations;

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must specify a user to reset.');

  var id = args[0];

  if(parseInt(id) === NaN) return await message.channel.send(':x: That is not a valid user ID.');

  await Meditations.deleteMany({
    usr: message.author.id
  });

  return message.channel.send(':white_check_mark: User has been removed from all databases.');
};

module.exports.config = {
  name: 'resetstats',
  aliases: ['reset'],
  module: 'Meditation',
  description: 'Resets a user\'s meditation stats.',
  usage: ['resetstats <user ID>'],
  admin: true,
};
