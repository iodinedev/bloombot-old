import config from '../config';
import Discord from 'discord.js';
import * as meditateUtils from '../utils/meditateUtils';
import { prisma } from '../databaseFiles/connect';

export const execute = async (client, message) => {
  let role = message.guild.roles.cache.get(config.roles.meditation_challenger);

  if (!role) return await message.channel.send(':x: Role does not exist.');

  await message.guild.members.fetch();

  if (role.members.size === 0)
    return await message.channel.send(":x: There's nobody in that role!");

  var limit = 1;
  var valid = false;

  var user;
  var userdata;

  // Days * Hours * Minutes * Seconds * Milliseconds
  const thirty = 30 * 24 * 60 * 60 * 1000;

  const now = new Date(Date.now() - thirty);

  while (valid == false && limit > 0) {
    user = role.members.random().user;

    userdata = await meditateUtils.getUserData(user.id, message.guild.id);

    var latest: {
      usr;
      date;
      time;
      guild;
    }[] = userdata.latest;

    console.log(latest)
    console.log(new Date(parseInt(latest[0].date)) >= now)
    console.log(new Date(parseInt(latest[1].date)) >= now)

    if (
      latest.length > 1 &&
      new Date(latest[0].date) >= now &&
      new Date(latest[1].date) >= now
    ) {
      valid = true;
    }

    limit--;
  }

  if (!valid)
    return await message.channel.send(
      ':x: Tried to find a winner and was unsuccessful. Try again.'
    );

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

  var channel = await client.channels.cache.get(config.channels.announce);

  await channel.send({ embeds: [announceEmbed] });

  await message.channel.send(
    `:white_check_mark: Announcement posted in <#${channel.id}>!`
  );

  try {
    const dmMessage = await user.send(
      '**Congratulations on winning the giveaway!** 🥳\n\nWould you like a Steam key to play *PLAYNE: The Meditation Game*?\n\nhttps://www.youtube.com/watch?v=P4JCE1oKjGs'
    );
    await prisma.pickMessages.create({
      data: {
        msg: dmMessage.id,
        guild: message.guild.id,
      }
    });
    await dmMessage.react('✅');
    await dmMessage.react('❌');
  } catch (err) {
    return await message.channel.send(
      `:x: Unable to DM user. It is likely they have disabled DMs. Please reach out to them personally.`
    );
  }

  return await message.channel.send(`:white_check_mark: User DMed!`);
};

export const architecture = {
  name: 'pick',
  aliases: [],
  module: 'Admin',
  description:
    'Selects a random user from the meditation challengers role and posts an announcement with their meditation time.',
  usage: ['pick'],
  //admin: true,
};
