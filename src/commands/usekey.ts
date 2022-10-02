import config from '../config';
const reactions = config.channelReacts;
import { prisma } from '../databaseFiles/connect';
import { DiscordAPIError } from 'discord.js';

export const execute = async (client, message) => {
  const channel = await message.author.createDM();

  try {
    const amount = await prisma.steamKeys.count({ where: { valid: true } });
    const key = await prisma.steamKeys.findMany({
      where: {
        valid: true,
      }
    });

    if (amount <= 3) {
      await message.guild.channels.cache
        .get(config.channels.logs)
        .send(
          `⚠️ Steam keys are running out (${amount} left). Add some more soon with \`.addkey\`.`
        );
    }

    if (key.length > 0) {
      try {
        await prisma.steamKeys.update({
          where: {
            text: key[0].text,
          },
          data: {
            valid: false,
          }
        });

        return await channel.send(
          `\`${key[0].text}\``
        );
      } catch (err) {
        return await message.channel.send(
          ':x: An error occured.'
        );
      }
    } else {
      return await message.channel.send(
        `No valid keys in database. Add some with \`.addkey\`.`
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
  name: 'usekey',
  aliases: [],
  module: 'Admin',
  admin: true,
  description: 'Selects a random key and sends it to the user who ran the command.',
  usage: ['usekey'],
};
