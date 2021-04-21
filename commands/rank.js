const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const Meditations = require('../databaseFiles/connect').Meditations;
const Discord = require('discord.js');
const config = require('../config.json');


module.exports.execute = async (client, message, args) => {
  var get_usr = message.author.id;

  if (args[0]) {
    get_usr = args[0].match(/\d/g);

    if (get_usr === null) return await message.channel.send(':x: Must be a user mention or user ID.')

    get_usr = get_usr.join("");
  }

  Meditations.find({
    usr: get_usr
  }).sort({_id:-1}).limit(3).toArray(async function(err, result) {
    var usr = await MeditationModel.findOne({
      usr: get_usr
    });

    const user = client.users.cache.get(get_usr);

    if (result.length === 0) return await message.channel.send(':x: This user has no meditation data.');

    var meditations = [];

    result.forEach(meditation => {
      var date = new Date(meditation.date);
      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();
      var year = date.getUTCFullYear();

      meditations.push(`\`${meditation.time}\` - ${day}/${month}/${year}\n`)

    let rankEmbed = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle('Meditation Stats')
      .setThumbnail(user.avatarURL())
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
  description: 'Shows how many minutes you or someone else has meditated for so far.',
  usage: ['rank [user mention or ID]'],
};
