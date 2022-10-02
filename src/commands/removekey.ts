import config from '../config';
const reactions = config.channelReacts;
import { prisma } from '../databaseFiles/connect';
import { DiscordAPIError } from 'discord.js';

export const execute = async (client, message, args) => {
  try {
    const key = await prisma.steamKeys.delete({
      where: {
        text: args.join(' '),
      }
    });

    if (key) {
      return await message.channel.send(
        `Removed key \`${key.text}\`.`
      );
    } else {
      return await message.channel.send(
        `No key found.`
      );
    }
  } catch (err) {
    if (err instanceof DiscordAPIError) {
      if (err.code === 10008) return false;

      console.error(err);
    }
  }
};

export const architecture = {
  name: 'removekey',
  aliases: [],
  module: 'Admin',
  admin: true,
  description: 'Remove a key from the database.',
  usage: ['removekey <key>'],
};
