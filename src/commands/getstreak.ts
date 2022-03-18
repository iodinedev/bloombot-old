import { prisma } from '../databaseFiles/connect';
import { Meditations } from '../databaseFiles/streaks';

export const execute = async (client, message) => {
  const meditations = Meditations(prisma.meditations);

  var streaks = await meditations.getStreak(message.author.id, message.guild.id);

  return await message.channel.send(`You have a **${streaks}** day streak.`);
};

export const architecture = {
  name: 'getstreak',
  aliases: ['streak'],
  module: 'Meditation',
  description: "Check how many days you've meditated for in a row.",
  usage: ['getstreak'],
};
