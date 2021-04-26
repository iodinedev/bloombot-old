module.exports.execute = async (client, message) => {
  return await message.channel.send('Under construction!');
};

module.exports.config = {
  name: 'timeleft',
  aliases: ['time'],
  module: 'Meditation',
  description: 'Shows you how much time is left for your current meditation session.',
  usage: ['timeleft'],
};
