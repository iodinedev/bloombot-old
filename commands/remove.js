const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Meditations = require('../databaseFiles/connect').Meditations;
const prefix = require('../config.json').prefix;
const { ObjectId } = require('mongodb');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(`:x: You must include a meditation ID to remove. Use \`${prefix}rank\` to see your recent meditations' IDs.`)
  const id = ObjectId(args[0]);

  var usr = await MeditationModel.findOne({
    usr: message.author.id
  });

  var meditation_count = Meditations.countDocuments() - 1;
  var time = 0;

  var meditation = await Meditations.findOne({
    _id: id
  });

  if (usr) {
    console.log(usr.usr);
    console.log(usr);
    time = usr.all_time - meditation.time;
  }

  console.log(time)

  var guild = await GuildModel.findOne({
    guild: message.guild.id
  });

  await Meditations.deleteOne({
    _id: id
  });

  await MeditationModel.updateOne(
    { usr: message.author.id },
    { $set: {
        all_time: time
      }
    }  
  );

  await GuildModel.updateOne(
    { guild: message.guild.id },
    {
      $set: {
        meditation_time: guild.meditation_time - time,
        meditation_count: guild.meditation_count - meditation_count
      }
    }
  );


  return await message.channel.send(':white_check_mark: Meditation entry has been removed.');
};

module.exports.config = {
  name: 'remove',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};
