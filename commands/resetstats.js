const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Meditations = require('../databaseFiles/connect').Meditations;

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must specify a user to reset.');

  var id = args[0];

  if(parseInt(id) === NaN) return await message.channel.send(':x: That is not a valid user ID.');

  await MeditationModel.find({
    usr: message.author.id
  }).toArray(async function(err, usr) {
    if (err) return console.error(err);

    var guild = await GuildModel.findOne({
      guild: message.guild.id
    });

    var meditation_count = Meditations.count();

    checks[meditations] = await Meditations.remove({
      usr: message.author.id
    });

    meditation_count = meditation_count - Meditations.count();

    var time = 0;

    if (usr) {
      time = usr.all_time;
    }

    await MeditationModel.remove({
      usr: message.author.id
    });

    await GuildModel.updateOne(
      { guild: message.guild.id },
      {
        $set: {
          meditation_time: guild.meditation_time - time,
          meditation_count: guild.meditation_count - meditation_count
        }
      }
    );


    return message.channel.send(':white_check_mark: User has been removed from all databases.');
  });
};

module.exports.config = {
  name: 'resetstats',
  aliases: ['reset'],
  module: 'Meditation',
  description: 'Resets a user\'s meditation stats.',
  usage: ['resetstats <user ID>'],
  admin: true,
};
