const config = require('../config.json');
const BotStats = require('../databaseFiles/connect').BotStats;

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const args = message.content.split(/\s+/g); // Return the message content and split the prefix.
  const command =
    message.content.startsWith(config.prefix) &&
    args.shift().slice(config.prefix.length);

  if (command) {
    const commandfile =
      client.commands.get(command) ||
      client.commands.get(client.aliases.get(command));

    if (commandfile) {
      message.channel.startTyping();

      if (commandfile.config.admin && commandfile.config.admin === true && config.global_admins.indexOf(message.author.id) === -1) {
        await message.channel.send(':x: You don\'t have permission to run this command.');
      } else {
        var total = 0;

        var stats = await BotStats.findOne({
          guild: message.guild.id
        });

        if (stats) {
          total = stats.total;
        }

        total = total + 1;

        await BotStats.updateOne(
          { bot: client.user.id },
          { $set: {
              bot: client.user.id,
              total: total,
              }
          },
          {
              upsert: true
          }
        );
        
        commandfile.execute(client, message, args); // Execute found command
      }

      message.channel.stopTyping();
    }
  }
};