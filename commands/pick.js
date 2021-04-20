const config = require('../config.json');
const Discord = require('discord.js');

module.exports.execute = async (client, message) => {
  let member = message.guild.roles.get(config.roles.challengers).members.cache.random().user;
  
  var usr = MeditationModel.findOne({usr: message.author.id});
  var all_time = 0;

  if (usr) {
    all_time = usr.all_time;
  }

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  const announceEmbed = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle(':tada: This month\'s meditation challenger in the spotlight is... :tada:')
    .addField(
      `**Monthly hall-of-fame member**`,
      `**${member.mention}** is our server member of the month, with a meditation time of **${all_time}** minutes!\nYou're doing great, keep at it!`
    )
    .setFooter(`${day}.${month}.${year}`);

  var channel = client.channels.cache.get(config.channels.announce_channel);

  return await channel.send(announceEmbed);
};

module.exports.config = {
  name: 'pick',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
  admin: true
};
