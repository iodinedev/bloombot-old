var MeditationModel = require('../databaseFiles/connect').MeditationModel;
var GuildModel = require('../databaseFiles/connect').GuildModel;
var config = require('../config.json');

module.exports.execute = async (client, message) => {
  var time = args[0];

  if (message.channel.id == config.channels.meditation) {
    if (parseInt(time) && time <= 600) {
        var member = message.member;
        var time = int(time);

        var usr = MeditationModel.findOne({usr: message.author.id});
        var all_time = 0;

        if (usr) {
            all_time = usr.all_time + time;
        }

        MeditationModel.updateOne(
            { usr: message.author.id },
            { $set: {
                usr: message.author.id,
                last_time: time,
                all_time: all_time
                }
            },
            {
                upsert: true
            }
        );
        
        var mettime = GuildModel.findOne({guild: message.guild.id});
        var meditation_time = 0;
        var meditation_count = 0;

        if (mettime) {
            meditation_time = mettime.meditation_time;
            meditation_count = mettime.meditation_count;
        }

        try {
            var role = member.guild.roles.cache.find(role => role.id === config.roles.meditation);

            await member.roles.add(role);
        } catch(err) {
            console.error("Role not found: " + err);
        }

        if (mettime.meditation_count !== 10) {
            meditation_count = mettime.meditation_count + 1
        } else {
            var time_in_hours = int(Math.round(mettime.meditation_time / 60, 1))
            await client.channels.cache.get(config.channel.meditation)
                .send(`Awesome sauce! This server has collectively generated ${time_in_hours} hours of realmbreaking meditation!`);

            mettime.meditation_count = 0
        }

        GuildModel.updateOne(
            { guild: message.guild.id },
            { $set: {
                guild: message.guild.id,
                meditation_time: meditation_time,
                meditation_count: meditation_count
                }
            },
            {
                upsert: true
            }
        );

        var motivation_message = motivation_messages[Math.random(motivation_message.length)]

        await message.channel.send(`You have meditated for ${time_of_mediation_minutes} minutes. Your total meditation time is ${all_time} minutes :tada:\n*${motivation_message}*`);

        var lvl_role;

        if (new_all_time >= 50) lvl_role = 'I_Star';
        if (new_all_time >= 100) lvl_role = 'II_Star';
        if (new_all_time >= 150) lvl_role = 'III_Star';
        if (new_all_time >= 250) lvl_role = 'I_S_Star';
        if (new_all_time >= 500) lvl_role = 'II_S_Star';
        if (new_all_time >= 1000) lvl_role = 'III_S_Star';
        if (new_all_time >= 2000) lvl_role = 'I_M_Star';
        if (new_all_time >= 5000) lvl_role = 'II_M_Star';
        if (new_all_time >= 10000) lvl_role = 'III_M_Star';
        if (new_all_time >= 20000) lvl_role = 'I_Star_S';
        if (new_all_time >= 50000) lvl_role = 'II_Star_S';
        if (new_all_time >= 100000) lvl_role = 'III_Star_S';

        lvl_role = member.guild.roles.cache.find(role => role.id === config.roles.lvl_roles[lvl_role]);

        config.roles.lvl_roles.forEach(role => {
            check_role = member.guild.roles.cache.find(role => role.id === config.roles.lvl_roles[role]);

            if (member.roles.cache.has(check_role)) {
                member.roles.remove(check_role);
                break;
            }
        });
        
        if (lvl_role) return await member.roles.add(lvl_role);
        else {
        return await message.channel.send(":x: Whoa, easy there tiger... You can just add under 600 minutes at once!");
        }
    } else {
        return await message.channel.send(`:x: You can execute this only in <#${config.channels.meditation}>.`);
    }
  }
};

module.exports.config = {
  name: 'add',
  aliases: [],
  module: 'Meditation',
  description: 'Adds minutes to your meditation time.',
  usage: ['add <time in minutes>']
};
