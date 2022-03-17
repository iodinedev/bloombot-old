import * as meditate_functions from '../commands/meditate.js';
import { prisma } from '../databaseFiles/connect';
import config from '../config';

export = async (client, oldState, newState) => {
  const currentDate = new Date().getTime();
  const guild = oldState.guild;
  const member = guild.members.cache.get(oldState.id);

  // Left a voice channel
  if (!newState.channelID || oldState.channelID) {
    await guild.channels.fetch();
    const voiceChannel = await guild.channels.cache.get(oldState.id);
    var humans = 0;

    if (voiceChannel && voiceChannel.members) {
      voiceChannel.members.forEach((member) => {
        if (!member.user.bot) humans += 1;
      });
    }

    if (humans === 0) {
      try {
        await voiceChannel.leave();
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const meditation = await prisma.current.findUnique({
        where: {
          usr: member.id,
        }
      });

      if (meditation) {
        let difference;
        if (meditation.whenToStop !== null) {
          difference = meditation.whenToStop - currentDate;
        } else {
          difference = currentDate - meditation.started;
        }

        difference = new Date(difference).getMinutes();

        if (meditation.time) difference = meditation.time - difference;

        await prisma.current.update({
          where: { usr: member.id },
          data: {
            time: difference,
          }
        });

        const new_meditation = await prisma.current.findUnique({
          where: {
            usr: member.id,
          }
        });

        meditate_functions.stop(
          client,
          new_meditation,
          difference,
          false,
          true
        );
      }
    } catch (err) {
      console.error('Meditation MongoDB error: ', err);
    }
  }

  // Joined a voice channel
  if (newState.channelID) {
    await guild.channels.fetch();
    const voiceChannel = guild.channels.cache.get(newState.channelID);

    if (member.user.bot) return;

    if ((await prisma.current.count()) > 0) {
      const latest_docs = await prisma.current.findMany({
        orderBy: [
          { id: 'desc' }
        ],
        take: 1
      });

      const latest = latest_docs[0];

      var latest_voice = await client.channels.cache.get(latest.channel);

      if (latest.guild === guild.id && latest_voice.id !== voiceChannel.id)
        return;

      let difference;
      difference = latest.whenToStop - currentDate;

      var time = new Date(difference).getMinutes();
      if (time === 0) time = 1;

      var curr = new Date();
      var stop = new Date(curr.getTime() + time * 60000).getTime();

      try {
        meditate_functions.begin(client, voiceChannel, true);

        try {
          var curr_role = await guild.roles.cache.find(
            (role) => role.id === config.roles.currently_meditating
          );

          await member.roles.add(curr_role);
        } catch (err) {
          console.error('Role not found: ' + err);
        }

        const meditation_channel = guild.channels.cache.find(
          (channel) => channel.id === config.channels.group_meditation
        );

        await meditation_channel.send(
          `:white_check_mark: You have joined the group meditation session with ${time} minutes remaining <@${member.id}>!\n**Note**: You can end your time at any point by simply leaving the voice channel.`
        );

        prisma.current.create({
          data: {
            usr: member.id,
            time: time,
            started: Date.now(),
            whenToStop: stop,
            guild: guild.id,
            channel: voiceChannel.id,
          }
        });

        var humans = 0;

        voiceChannel.members.forEach((member) => {
          if (!member.user.bot) humans += 1;
        });
      } catch (err) {
        console.error('Meditation MongoDB error: ', err);
      }
    }
  }
};
