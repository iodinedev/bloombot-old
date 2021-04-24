const config = require('../config.json');
const Discord = require('discord.js');
const meditateUtils = require('../utils/meditateUtils');

module.exports.execute = async (client, message) => {
  let role = message.guild.roles.cache.get(config.roles.meditation_challenger);
  
  if (!role) return await message.channel.send(':x: Role does not exist.');

  await message.guild.members.fetch();
  
  if (role.members.size === 0) return await message.channel.send(':x: There\'s nobody in that role!')
  let user = role.members.random().user;
  
  var userdata = await meditateUtils.getUserData(user.id, message.guild.id);
  
  var user_time = userdata.meditation_time;

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  const announceEmbed = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle(':tada: This month\'s meditation challenger in the spotlight is... :tada:')
    .addField(
      `**Monthly hall-of-fame member**`,
      `**${user}** is our server member of the month, with a meditation time of **${user_time}** minutes!\nYou're doing great, keep at it!`
    )
    .setFooter(`Chosen on ${day}/${month}/${year}`);

  var channel = client.channels.cache.get(config.channels.announce);

  await channel.send(announceEmbed);

  return await message.channel.send(`:white_check_mark: Announcement posted in <#${channel.id}>!`)
};

module.exports.config = {
  name: 'pick',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
  admin: true
};
