import { prisma } from '../databaseFiles/connect';
import * as meditateUtils from '../utils/meditateUtils';
import config from '../config';
import Discord from 'discord.js';
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";

export const execute = async (client, message, args) => {
  var voiceChannel = message.member.voice;

  if (voiceChannel.channel) {
    const latest_docs = await prisma.current.findMany({
      orderBy: [
        {
          id: 'desc'
        }
      ],
      take: 1
    });

    if (latest_docs.length > 0) {
      const latest = latest_docs[0];

      var latest_voice = await client.channels.cache.get(latest.channel);

      if (
        latest.guild === message.guild.id &&
        latest_voice.id !== voiceChannel.channel.id
      )
        return await message.channel.send(
          ":x: There's already a meditation session going on in a different channel in this server!"
        );
    }

    var time: number = Infinity;
    var curr = Date.now();
    var stop: number = Infinity;
    var usr;

    if (args && args[0]) {
      time = parseInt(args[0]);
      stop = new Date(curr + time * 60000).getTime();
    }

    try {
      usr = await prisma.current.findUnique({
        where: {
          usr: message.author.id,
        }
      });
    } catch (err) {
      console.error('Meditate MongoDB error: ', err);
    }

    if (usr)
      return await message.channel.send(':x: You are already meditating!');

    try {
      begin(client, message);

      const meditators: {
        usr: string,
        time: number,
        whenToStop: string,
        started: string,
        guild: string,
        channel: string
      }[] = [];
      var curr_role = await message.member.guild.roles.cache.find(
        (role) => role.id === config.roles.currently_meditating
      );

      for (const [memberID, vc_member] of voiceChannel.channel.members) {
        if (!vc_member.user.bot) {
          meditators.push({
            usr: memberID,
            time: time,
            whenToStop: `${stop}`,
            started: `${curr}`,
            guild: message.guild.id,
            channel: voiceChannel.channel.id,
          });

          try {
            await vc_member.roles.add(curr_role);
          } catch (err) {
            console.error('Role not found: ' + err);
          }
        }
      }

      let people =
        meditators.length > 1 ? `${meditators.length} people` : 'You';

      if (isFinite(time)) {
        let plural = time > 1 ? 'minutes' : 'minute';

        await message.channel.send(
          `:white_check_mark: ${people} will be notified at the end of ${time} ${plural} via DM!\n**Note**: Participants may end their own meditation at any time by simply leaving the voice channel.`
        );
      } else {
        await message.channel.send(
          `:infinity: ${people} have started an infinite meditation session!\n**Note**: Participants may end their own meditation at any time by simply leaving the voice channel.`
        );
      }

      await prisma.current.createMany({ data: meditators });

      var humans = 0;

      voiceChannel.channel.members.forEach((member) => {
        if (!member.user.bot) humans += 1;
      });
    } catch (err) {
      console.error('Meditation MongoDB error: ', err);
    }
  } else {
    return await message.channel.send(
      ':x: You need to be in a voice channel to execute this command.'
    );
  }
};

export async function begin(client, message, voiceupdate = false) {
  var link = config.meditation_sound;

  if (!voiceupdate) {
    try {
      const connection = joinVoiceChannel(
        {
          channelId: message.member.voice.channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator
        });

      const resource = createAudioResource(link);
      const player = createAudioPlayer();

      if (link) {
        player.play(resource);
        connection.subscribe(player);
      }
    } catch(err) {
      console.error(err);
    }
  }
}

export async function stop(
  client,
  meditation,
  difference,
  catchUp = false,
  voiceupdate = false
) {
  let description;
  var time = meditation.time;
  const guild = client.guilds.cache.get(meditation.guild);
  const voice = guild.channels.cache.get(meditation.channel);
  await guild.members.fetch();
  const user = guild.members.cache.get(meditation.usr);

  try {
    var role = await user.guild.roles.cache.find(
      (role) => role.id === config.roles.currently_meditating
    );

    await user.roles.remove(role);
  } catch (err) {
    console.error('Role not found: ' + err);
  }

  try {
    if (voice.members.size === 1) {
      for (const [memberID, vc_member] of voice.members) {
        if (memberID === client.user.id) {
          try {
            const connection = getVoiceConnection(guild.id);

            if (connection)
              connection.destroy();
          } catch (err) {
            console.error(err);
          }
        }
      }
    } else {
      var link = config.meditation_sound;

      if (!voiceupdate) {
        try {
          const connection = joinVoiceChannel(
            {
              channelId: voice.channel.id,
              guildId: guild.id,
              adapterCreator: guild.voiceAdapterCreator
            });
    
          const resource = createAudioResource(link);
          const player = createAudioPlayer();
    
          if (link) {
            player.play(resource);
            connection.subscribe(player);
          }
        } catch(err) {
          console.error(err);
        }

        setTimeout(function () {
          const connection = getVoiceConnection(guild.id);

          if (connection)
            connection.destroy();
        }, 20000);
      }
    }
  } catch (err) {
    console.error(err);
  }

  if (catchUp) {
    description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you have finished your **${meditation.time}** minutes of meditation. I've added it to your total.`;
    time = time + difference;
  } else {
    description = `Hello! Your **${meditation.time}** minutes of meditation are done! I've added it to your total.`;
  }

  if (time > 0)
    await meditateUtils.addToDatabase(user.id, meditation.guild, time);
  else
    description =
      ':warning: Meditation time was too short; no meditation minutes were added.';

  try {
    var userdata = await meditateUtils.getUserData(
      user.id,
      meditation.guild.id
    );
    var streak = userdata.streak;
    var user_time = userdata.meditation_time;

    // Level tests
    if (user_time >= 50) {
      var lvl_role = 'I_Star';

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

      var add_lvl_role = await guild.roles.cache.find(
        (role) => role.id === config.roles.lvl_roles[lvl_role]
      );

      const levelRoles = Object.values(config.roles.lvl_roles);
      var shouldAdd = true;

      await levelRoles.every(async (roleid) => {
        if (user.roles.cache.has(roleid)) {
          var check_role = await guild.roles.cache.find(
            (role) => role.id === roleid
          );

          if (check_role.position < add_lvl_role.position) {
            user.roles.remove(check_role);
          } else {
            shouldAdd = false;
          }
        }
      });

      if (shouldAdd && add_lvl_role) await user.roles.add(add_lvl_role);
    }

    // Streak tests
    if (streak >= 7) {
      var streak_role = 'egg';

      if (streak >= 14) streak_role = 'hatching_chick';
      if (streak >= 28) streak_role = 'baby_chick';
      if (streak >= 35) streak_role = 'chicken';
      if (streak >= 56) streak_role = 'dove';
      if (streak >= 70) streak_role = 'owl';
      if (streak >= 140) streak_role = 'eagle';
      if (streak >= 365) streak_role = 'dragon';
      if (streak >= 730) streak_role = 'alien';

      var add_streak_role = await guild.roles.cache.find(
        (role) => role.id === config.roles.streak_roles[streak_role]
      );

      const streakRoles = Object.values(config.roles.streak_roles);
      var shouldAdd = true;

      await streakRoles.every(async (roleid) => {
        if (user.roles.cache.has(roleid)) {
          var check_role = await guild.roles.cache.find(
            (role) => role.id === roleid
          );

          if (check_role && check_role.position < add_streak_role.position) {
            user.roles.remove(check_role);
          } else {
            shouldAdd = false;
          }
        }
      });

      if (shouldAdd && add_streak_role) await user.roles.add(add_streak_role);
    }
  } catch (err) {
    console.error(err);
  }

  const stopMessage = new Discord.MessageEmbed();
  stopMessage.color = config.colors.embedColor;
  stopMessage.title = `${config.emotes.meditation} Meditation Time Done ${config.emotes.meditation}`;
  stopMessage.description = description;

  user.send({ embeds: [stopMessage] });

  try {
    // In case there was an error, delete all a user's current meditation sessions
    await prisma.current.deleteMany({
      where: {
        usr: meditation.usr,
      }
    });
  } catch (err) {
    console.error('Meditation MongoDB error: ', err);
  }
}

export async function scanForMeditations(client) {
  const currentDate = new Date().getTime();

  try {
    const meditations = await prisma.current.findMany();

    if (meditations) {
      let difference;
      meditations.forEach(async (meditation) => {
        if (meditation.whenToStop !== null) {
          difference = currentDate - parseInt(meditation.whenToStop);
          if (difference > -1 * config.meditationScanInterval) {
            stop(client, meditation, difference);
          }
        }
      });
    }
  } catch (err) {
    console.error('Meditation MongoDB error: ', err);
  }
}

export async function catchUp(client) {
  const currentDate = new Date().getTime();

  try {
    const meditations = await prisma.current.findMany();

    if (meditations) {
      let difference: number;
      meditations.forEach(async (meditation) => {
        if (meditation.whenToStop !== null) {
          difference = currentDate - parseInt(meditation.whenToStop);
          if (difference > 0) {
            stop(client, meditation, difference, true);
          }
        }
      });
    }
  } catch (err) {
    console.error('Meditation MongoDB error: ', err);
  }
}

export const architecture = {
  name: 'meditate',
  aliases: [],
  module: 'Meditation',
  description:
    'Keeps track of your meditation time for you. Join a voice channel and run the command, specifying how many minutes you would like to meditate for (or leave it blank to begin an infinite meditation session). It will join and play a gong sound to mark the beginning.\nYou may leave at any point to log the time so far.',
  usage: ['meditate [time in minutes]'],
};
