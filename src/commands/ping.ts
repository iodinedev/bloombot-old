export const execute = async (client, message) => {
  message.channel.send('Getting ping data...').then(async (msg) => {
    msg.edit(
      `🏓 Latency is \`${
        msg.createdTimestamp - message.createdTimestamp
      }ms\`. API Latency is \`${Math.round(client.ws.ping)}ms\`.`
    );
  });
};

export const architecture = {
  name: 'ping',
  aliases: [],
  module: 'Utility',
  description: "Checks the bot's latency.",
  usage: ['ping'],
};
