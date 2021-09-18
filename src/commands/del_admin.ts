import { ServerSetup } from '../databaseFiles/connect';

export const execute = async (client, message, args) => {
  if (!args)
    return await message.channel.send(':x: Must include a user ID to remove.');

  var db_admins = await ServerSetup.findOne({
    guild: message.guild.id,
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

  await ServerSetup.updateOne(
    { guild: message.guild.id },
    { $set: { admins: admins } },
    { upsert: true }
  );

  return await message.channel.send(
    `:white_check_mark: User has been removed from admin permissions.`
  );
};

export const architecture = {
  name: 'deladmin',
  aliases: ['rmadmin'],
  module: 'Admin',
  description: 'Removes a user from the bot admin list.',
  usage: ['deladmin <user ID>'],
  admin: true,
};
