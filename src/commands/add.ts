import * as meditateUtils from '../utils/meditateUtils';
import config from '../config';

export const execute = async (client, message, args) => {
  var time = parseInt(args[0]);

  if (message.channel.id === config.channels.meditation) {
    if (time <= 0)
      return message.channel.send(
        ':x: Your meditation time must be greater than zero.'
      );

    if (time !== NaN && time <= 600) {
      var member = message.member;
      await meditateUtils.addToDatabase(
        message.author.id,
        message.guild.id,
        time
      );

      var userdata = await meditateUtils.getUserData(
        message.author.id,
        message.guild.id
      );
      var guilddata = await meditateUtils.getGuildData(message.guild.id);

      var user_time = userdata.meditation_time;
      var streak = userdata.streak;

      var guild_count = guilddata.meditation_count;
      var guild_time = guilddata.meditation_time;

      if (guild_count % 10 === 0 && guild_time) {
        var time_in_hours = Math.round(guild_time / 60);

        await client.channels.cache
          .get(config.channels.meditation)
          .send(
            `Awesome sauce! This server has collectively generated ${time_in_hours} hours of realmbreaking meditation!`
          );
      }

      var motivation_message =
        config.motivation_messages[
          Math.floor(Math.random() * config.motivation_messages.length)
        ];

      await message.channel.send(
        `You have meditated for ${time} minutes. Your total meditation time is ${user_time} minutes :tada:\n*${motivation_message}*`
      );

      try {
        var lvl_role;

        if (user_time >= 50) lvl_role = 'I_Star';
        if (user_time >= 100) lvl_role = 'II_Star';
        if (user_time >= 150) lvl_role = 'III_Star';
        if (user_time >= 250) lvl_role = 'I_S_Star';
        if (user_time >= 500) lvl_role = 'II_S_Star';
        if (user_time >= 1000) lvl_role = 'III_S_Star';
        if (user_time >= 2000) lvl_role = 'I_M_Star';
        if (user_time >= 5000) lvl_role = 'II_M_Star';
        if (user_time >= 10000) lvl_role = 'III_M_Star';
        if (user_time >= 20000) lvl_role = 'I_Star_S';
        if (user_time >= 50000) lvl_role = 'II_Star_S';
        if (user_time >= 100000) lvl_role = 'III_Star_S';

        await Object.values(config.roles.lvl_roles).every(async (roleid) => {
          if (member.roles.cache.has(roleid)) {
            var check_role = await member.guild.roles.cache.find(
              (role) => role.id === roleid
            );

            member.roles.remove(check_role);
          }
        });

        var add_lvl_role = await member.guild.roles.cache.find(
          (role) => role.id === config.roles.lvl_roles[lvl_role]
        );
        if (add_lvl_role) await member.roles.add(add_lvl_role);

        var streak_role;

        if (streak >= 7) streak_role = 'egg';
        if (streak >= 14) streak_role = 'hatching_chick';
        if (streak >= 28) streak_role = 'baby_chick';
        if (streak >= 35) streak_role = 'chicken';
        if (streak >= 56) streak_role = 'dove';
        if (streak >= 70) streak_role = 'owl';
        if (streak >= 140) streak_role = 'eagle';
        if (streak >= 365) streak_role = 'dragon';
        if (streak >= 730) streak_role = 'alien';

        var add_streak_role = await member.guild.roles.cache.find(
          (role) => role.id === config.roles.streak_roles[streak_role]
        );
        if (add_streak_role) await member.roles.add(add_streak_role);
      } catch (err) {
        console.error(err);
      }

      return;
    } else {
      return await message.channel.send(
        ':x: Whoa, easy there tiger... You can only add up to 600 minutes at once!'
      );
    }
  } else {
    return await message.channel.send(
      `:x: You can only execute this in <#${config.channels.meditation}>.`
    );
  }
};

export const architecture = {
  name: 'add',
  aliases: [],
  module: 'Meditation',
  description: 'Adds minutes to your meditation time.',
  usage: ['add <time in minutes>'],
};
