const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const Meditations = require('../databaseFiles/connect').Meditations;
const Discord = require('discord.js');
const config = require('../config.json');


module.exports.execute = async (client, message) => {
  Meditations.find({
    usr: message.author.id
  }).sort({_id:-1}).limit(3).toArray(async function(err, result) {
    var usr = await MeditationModel.findOne({
      usr: message.author.id
    });

    console.log(result);

    var meditations = [];

    result.forEach(meditation => {
      var date = new Date(meditation.date);
      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();
      var year = date.getUTCFullYear();

      meditations.push(`\`${meditation.time}\` - ${day}/${month}/${year}\n`)
    })

    console.log(message.author.avatarURL())

    let rankEmbed = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle('Meditation Stats')
      .setThumbnail(message.author.avatarURL())
      .addField(
        'Meditation Minutes',
        usr.all_time
      )
      .addField(
        'Recent Meditations',
        meditations
      );

    return message.channel.send(rankEmbed);
  });
};

module.exports.config = {
  name: 'rank',
  aliases: ['stats'],
  module: 'Meditation',
  description: 'Shows how many minutes you have meditated for so far.',
  usage: ['rank'],
};
