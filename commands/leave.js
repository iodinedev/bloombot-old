module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a channel ID for me to leave.');

  const guild = message.guild;
  const voiceChannel = guild.channels.cache.get(args[0]);

  try {
    await voiceChannel.leave();
    return await message.channel.send(':white_check_mark: Disconnected.');
  } catch(err) {
    console.error(err);
    return await message.channel.send(':x: An error occured. Did you include the correct channel ID?');
  }
};

module.exports.config = {
  name: 'leave',
  aliases: [],
  module: 'Admin',
  description: 'Manually disconnect the bot from a voice channel in the server.',
  usage: ['leave <voice channel ID>'],
  admin: true,
};
