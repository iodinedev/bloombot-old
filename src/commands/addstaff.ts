import { prisma } from '../databaseFiles/connect';

export const execute = async (client, message, args) => {
  try {
    var user = await client.users.fetch(args[0]);
    var role = await message.guild.roles.fetch(args[0]);

    if (!user || !user.id || !role || !role.id)
      return await message.channel.send(':x: Must include a valid user or role ID.');
  } catch (err) {
    console.error(err);
    return await message.channel.send(
      ':x: Something went wrong. Did you include a user or role ID?'
    );
  }

  var admins: any[] = [];
  var db_admins = await prisma.serverSetup.findUnique({
    where: {
      guild: message.guild.id,
    }
  });

  if (db_admins && db_admins.admins) {
    await db_admins.admins.forEach((admin) => {
      admins.push(admin);
    });
  }

  if (admins.indexOf(user.id) !== -1)
    return await message.channel.send(
      ':x: That user or role already exists in the admin database.'
    );

  admins.push(user.id);

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

  if (user.id) {
    return await message.channel.send(
      `:white_check_mark: ${user.username} has been added as an admin!`
    );
  } else if (role.id) {
    return await message.channel.send(
      `:white_check_mark: ${role.name} has been added as an admin!`
    );
  }
};

export const architecture = {
  name: 'addstaff',
  aliases: [],
  module: 'Admin',
  description: 'Adds a user to the bot staff list.',
  usage: ['addstaff <user ID>'],
  admin: true,
};
