import { prisma } from '../databaseFiles/connect';

export const execute = async (client, message, args) => {
  let prefix;
  try {
    prefix = await prisma.serverSetup.findUnique({ where: { guild: message.guild.id } });
    prefix = prefix.prefix;
  } catch {
    prefix = '.';
  }

  if (!args[0])
    return await message.channel.send(
      `:x: You must include a meditation ID to remove. Use \`${prefix}rank\` to see your recent meditations' IDs.`
    );

  try {
    var meditation = await prisma.meditations.findUnique({
      where: {
        id: parseInt(args[0])
      }
    });

    if (!meditation || !meditation.usr)
      return await message.channel.send(
        ':x: That meditation session does not exist in the database. Be sure to select by ID.'
      );

    if (meditation.usr !== message.author.id)
      return await message.channel.send(
        ":x: You cannot delete someone else's meditations."
      );

    await prisma.meditations.delete({
      where: {
        id: parseInt(args[0]),
      }
    });

    return await message.channel.send(
      ':white_check_mark: Meditation entry has been removed.'
    );
  } catch (err) {
    console.log(err)

    return await message.channel.send(
      ':x: ID could not be parsed. Make sure you use a valid meditation session ID.'
    );
  }
};

export const architecture = {
  name: 'remove',
  aliases: [],
  module: 'Meditation',
  description: `Deletes a meditation session by ID. Use the \`rank\` command to see your recent meditations as well as their IDs.`,
  usage: ['remove <meditation ID>'],
};
