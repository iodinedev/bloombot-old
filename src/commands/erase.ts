import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message, args) => {
  if (args && args[0]) {
    const erase_msg = await message.channel.messages.fetch(args[0]);

    if (!erase_msg)
      return await message.channel.send(
        ":x: Message could not be found. Please use the message's ID."
      );

    const reason = args.slice(1).join(' ');
    await message.guild.members.fetch();
    const sender = message.guild.members.cache.get(erase_msg.author.id);

    await erase_msg.delete();

    let eraseReasonMessage = new Discord.MessageEmbed();
    eraseReasonMessage.color = config.colors.embedColor;
    eraseReasonMessage.title = 'A message you sent was deleted';
    eraseReasonMessage.description = reason ? reason : 'No reason provided.';

    await sender.send({ embeds: [eraseReasonMessage] });

    return await message.delete();
  } else {
    return await message.channel.send(
      ':x: You must specify a message to delete.'
    );
  }
};

export const architecture = {
  name: 'erase',
  aliases: ['rm'],
  module: 'Moderator',
  moderator: true,
  description: `Deletes a message and alerts the user why with a reason.`,
  usage: ['erase <message ID> [reason]'],
};
