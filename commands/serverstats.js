const meditateUtils = require('../utils/meditateUtils');
const Discord = require('discord.js');
const config = require('../config.json');


module.exports.execute = async (client, message) => {
  var data = await meditateUtils.getGuildData(message.guild.id);
  var guild_count = data.meditation_count;
  var guild_time = data.meditation_time;

  if (!guild_count) return await message.channel.send(':x: No data found for this guild!');

  let rankEmbed = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle('Server Meditation Stats')
    .addField(
      'Meditation Minutes',
      guild_time
    )
    .addField(
      'Meditation Count',
      guild_count
    );

  return await message.channel.send(rankEmbed);
};

module.exports.config = {
  name: 'serverstats',
  aliases: [],
  module: 'Meditation',
  description: 'Shows how many minutes the guild has meditated for.',
  usage: ['serverstats'],
};
