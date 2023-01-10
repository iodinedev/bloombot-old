import { prisma } from '../databaseFiles/connect';

export const execute = async (client, message, args) => {
  if (!args)
    return await message.channel.send(':x: Must include a user ID to remove.');

  var db_admins = await prisma.serverSetup.findUnique({
    where: {
      guild: message.guild.id,
    }
  });

  if (!db_admins || !db_admins.admins)
    return await message.channel.send(
      ':x: This server has no global admins in the database.'
    );

  if (db_admins.admins.indexOf(args[0]) === -1)
    return await message.channel.send(
      ':x: That user does not exist in the admin database.'
    );

  var admins = db_admins.admins;

  admins.splice(admins.indexOf(args[0]), 1);

  await prisma.serverSetup.upsert({
    where: {
      guild: message.guild.id
    },
    update: {
      admins: admins
    },
    create: {
      guild: message.guild.id,
      admins: admins
    }
  });

  return await message.channel.send(
    `:white_check_mark: User has been removed from admin permissions.`
  );
};

export const architecture = {
  name: 'delstaff',
  aliases: ['rmstaff'],
  module: 'Admin',
  description: 'Removes a user from the bot staff list.',
  usage: ['delstaff <user ID>'],
  admin: true,
};
