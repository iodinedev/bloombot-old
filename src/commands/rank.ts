import * as meditateUtils from '../utils/meditateUtils';
import { Meditations } from '../databaseFiles/connect';
import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message, args) => {
  var get_usr = message.author.id;

  if (
    message.channel.id === config.channels.meditation ||
    message.channel.id === config.channels.commands
  ) {
    if (args[0]) {
      get_usr = args[0].match(/\d/g);

      if (get_usr === null)
        return await message.channel.send(
          ':x: Must be a user mention or user ID.'
        );

      get_usr = get_usr.join('');
    }

    Meditations.find({
      $and: [{ usr: get_usr }, { guild: message.guild.id }],
    })
      .sort({ _id: -1 })
      .limit(3)
      .toArray(async function (err, result) {
        if (!result)
          return await message.channel.send(
            ":x: Looks like you don't have any meditation times! Use `.add` to add some time."
          );
        var data = await meditateUtils.getUserData(get_usr, message.guild.id);
        var user_count = 0;
        var user_time = 0;
        var streak = 0;

        if (data) {
          user_count = data.meditation_count;
          user_time = data.meditation_time;
          streak = data.streak;
        }

        await message.guild.members.fetch();
        const user = client.users.cache.get(get_usr);

        var meditations: string[] = [];

        result.forEach((meditation) => {
          var date = new Date(meditation.date);
          var month = date.getUTCMonth() + 1;
          var day = date.getUTCDate();
          var year = date.getUTCFullYear();

          meditations.push(
            `**${meditation.time}m** on ${day}/${month}/${year}\nID: \`${meditation._id}\`\n`
          );
        });

        const fields = [
          {
            name: 'Meditation Minutes',
            value: `${user_time}`,
            inline: false,
          },
          {
            name: 'Meditation Count',
            value: `${user_count}`,
            inline: false,
          },
          {
            name: 'Recent Meditations',
            value: meditations.length === 0 ? 'None' : `${meditations}`,
            inline: false,
          },
          {
            name: 'Current Streak',
            value: `${streak} days`,
            inline: false,
          },
        ];

        let rankEmbed = new Discord.MessageEmbed();
        rankEmbed.color = config.colors.embedColor;
        rankEmbed.title = 'Meditation Stats';
        rankEmbed.thumbnail = user.avatarURL();
        rankEmbed.fields.push(...fields);

        return message.channel.send({ embeds: [rankEmbed] });
      });
  } else {
    return await message.channel.send(
      `:x: You can execute this only in <#${config.channels.meditation}> or <#${config.channels.commands}>.`
    );
  }
};

export const architecture = {
  name: 'rank',
  aliases: ['stats'],
  module: 'Meditation',
  description:
    'Shows how many minutes you or someone else has meditated for so far.',
  usage: ['rank [user mention or ID]'],
};
