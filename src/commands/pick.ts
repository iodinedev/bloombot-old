import config from '../config';
import Discord from 'discord.js';
import * as meditateUtils from '../utils/meditateUtils';

export const execute = async (client, message) => {
  let role = message.guild.roles.cache.get(config.roles.meditation_challenger);

  if (!role) return await message.channel.send(':x: Role does not exist.');

  await message.guild.members.fetch();

  if (role.members.size === 0)
    return await message.channel.send(":x: There's nobody in that role!");
  let user = role.members.random().user;

  var userdata = await meditateUtils.getUserData(user.id, message.guild.id);

  var user_time = userdata.meditation_time;

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  const announceEmbed = new Discord.MessageEmbed();
  announceEmbed.color = config.colors.embedColor;
  announceEmbed.title =
    ":tada: This month's meditation challenger in the spotlight is... :tada:";
  announceEmbed.thumbnail = user.avatarURL();
  announceEmbed.fields.push({
    name: `**Monthly hall-of-fame member**`,
    value: `**${user}** is our server member of the month, with a meditation time of **${user_time}** minutes!\nYou're doing great, keep at it!`,
    inline: false,
  });
  announceEmbed.footer = { text: `Chosen on ${day}/${month}/${year}` };

  var channel = client.channels.cache.get(config.channels.announce);

  await channel.send(announceEmbed);

  return await message.channel.send(
    `:white_check_mark: Announcement posted in <#${channel.id}>!`
  );
};

export const architecture = {
  name: 'pick',
  aliases: [],
  module: 'Admin',
  description:
    'Selects a random user from the meditation challengers role and posts an announcement with their meditation time.',
  usage: ['pick'],
  admin: true,
};
