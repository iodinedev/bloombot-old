import { prisma } from '../databaseFiles/connect';
import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message) => {
  var admins = await prisma.serverSetup.findUnique({
    where: {
      guild: message.guild.id,
    }
  });

  if (!admins || !admins.admins)
    return await message.channel.send(':x: This server has no custom admins.');

  var pretty = '';

  admins.admins.forEach((admin) => {
    pretty = pretty + `\n - \`${admin}\``;
  });

  let helpMessage = new Discord.MessageEmbed();
  helpMessage.color = config.colors.embedColor;
  helpMessage.title = 'List of Global Admins';
  helpMessage.description = pretty;

  return await message.channel.send({ embeds: [helpMessage] });
};

export const architecture = {
  name: 'listadmins',
  aliases: ['listadmin', 'admins'],
  module: 'Admin',
  description: 'Lists global admins in the database.',
  usage: ['listadmins'],
  admin: true,
};
