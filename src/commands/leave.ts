import { getVoiceConnection } from "@discordjs/voice";

export const execute = async (client, message, args) => {
  const guild = message.guild;

  try {
    const connection = getVoiceConnection(guild.id);

    if (connection) {
      connection.destroy();
      return await message.channel.send(':white_check_mark: Disconnected.');
    }

    return await message.channel.send(':warning: Nothing to disconnect from.');
  } catch (err) {
    console.error(err);
    return await message.channel.send(
      ':x: An error occured.'
    );
  }
};

export const architecture = {
  name: 'leave',
  aliases: [],
  module: 'Staff',
  description:
    'Manually disconnect the bot from a voice channel in the server.',
  usage: ['leave'],
  staff: true,
};
