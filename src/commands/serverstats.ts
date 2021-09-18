import * as meditateUtils from '../utils/meditateUtils';
import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message) => {
  var data = await meditateUtils.getGuildData(message.guild.id);
  var guild_count = data.meditation_count;
  var guild_time = data.meditation_time;

  if (!guild_count)
    return await message.channel.send(':x: No data found for this guild!');

  let rankEmbed = new Discord.MessageEmbed();
  rankEmbed.color = config.colors.embedColor;
  rankEmbed.title = 'Server Meditation Stats';
  rankEmbed.fields.push(
    {
      name: 'Meditation Minutes',
      value: `${guild_time}`,
      inline: false,
    },
    {
      name: 'Meditation Count',
      value: `${guild_count}`,
      inline: false,
    }
  );

  return await message.channel.send({embeds: [ rankEmbed ]});
};

export const architecture = {
  name: 'serverstats',
  aliases: [],
  module: 'Meditation',
  description: 'Shows how many minutes the guild has meditated for.',
  usage: ['serverstats'],
};
