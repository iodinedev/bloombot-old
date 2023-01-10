import * as meditateUtils from '../utils/meditateUtils';
import config from '../config';

export const execute = async (client, message, args) => {
  const time = parseInt(args[0]);
  const date = new Date(args[1] * 1000);
  const user = message.mentions.users.first() || message.guild.members.cache.get(args[2]);

  if (time === null || isNaN(time) || !date || !user) {
    if (!time || isNaN(time)) {
      await message.channel.send(':x: You must provide a valid time.');
    } else if (!date) {
      await message.channel.send(':x: You must provide a valid date.');
    } else if (!user) {
      await message.channel.send(':x: You must provide a valid user.');
    }

    return;
  }

  const userId = user.id;

  console.log(time);
  console.log(date);
  console.log(userId);

  await meditateUtils.mendToDatabase(
    message.guild.id,
    time,
    date,
    userId,
  );
};

export const architecture = {
  name: 'insert',
  aliases: [],
  module: 'Staff',
  staff: true,
  description: 'Mends a user\'s streak by inserting a meditation session.',
  usage: ['.insert <time> <date> <user>'],
};
