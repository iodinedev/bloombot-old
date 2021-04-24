const Discord = require('discord.js');
const config = require('../config.json');
const Prefixes = require('../databaseFiles/connect').Prefixes;
const {distance, closest} = require('fastest-levenshtein');

function capitalizeFLetter(input) {
  return input[0].toUpperCase() + input.slice(1);
}

module.exports.execute = async (client, message, args) => {
  let commands = client.commands;
  var modules = config.modules;
  var cleanmodules = modules.map((v) => v.toLowerCase());
  let commandNames = [];

  let prefix;
  try {
    prefix = await Prefixes.findOne({'guild': message.guild.id});
    prefix = prefix.prefix;
  } catch {
    prefix = '.';
  }

  if (!args || args.length === 0) {
    var modulelist = '';

    let helpMessage = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle('List of available modules')
      .setDescription(
        `Modules available in ${message.guild.name}. Use \`${prefix}help [module]\` for more about a specific module.`
      );
    modules.forEach((module) => {
      modulelist = modulelist.concat(`${module}\n`);
    });
    try {
      helpMessage.addField(`All Modules`, `${modulelist}`);
      return await message.channel.send(helpMessage).then(bot_msg => {
        bot_msg.delete({timeout: 10000});
      });
    } catch (err) {
      console.log(err);
    }
  } else if (args.length === 1) {
    let command = commands.find(
      (requestedcommand) =>
        requestedcommand.config.name === args[0].toLowerCase() ||
        requestedcommand.config.aliases.find(
          (alias) => alias === args[0].toLowerCase()
        )
    );

    if (command) {
      let helpMessage = new Discord.MessageEmbed()
        .setColor(config.colors.embedColor)
        .setTitle(`${prefix}${command.config.name}`)
        .setDescription(
          `You asked for information on \`${prefix}${command.config.name}\``
        );
      helpMessage.addField('Description:', command.config.description);
      helpMessage.addField('Aliases:', command.config.aliases.length > 0 ? command.config.aliases : 'None');
      helpMessage.addField('Usage:', command.config.usage);

      try {
        message.channel.send(helpMessage).then(bot_msg => {
          bot_msg.delete({ timeout: 10000 });
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      if (cleanmodules.includes(args[0].toLowerCase())) {
        var modCmd = args[0].toLowerCase(); // User input

        let helpMessage = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle(`${capitalizeFLetter(modCmd)}`)
          .setDescription(`You asked for commands under the ${modCmd} module.`);

        commands.forEach((requestedcommand) => {
          if (
            requestedcommand.config.module.toLowerCase() ==
            args[0].toLowerCase()
          ) {
            helpMessage.addField(
              `**${prefix}${requestedcommand.config.name}**`,
              `${requestedcommand.config.description}`
            );
          }
        });
        try {
          message.channel.send(helpMessage).then(bot_msg => {
            bot_msg.delete({ timeout: 10000 });
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        commands.forEach((requestedcommand) => {
          commandNames.push(requestedcommand.config.name);
          requestedcommand.config.aliases.forEach((alias) =>
            commandNames.push(alias)
          );
        });
        return didYouMean(commandNames, args[0].toLowerCase(), message);
      }
    }
  }
};

async function didYouMean(commands, search, message) {
  if (!commands.includes(search)) {
    return await message.channel
      .send(
        `Did you mean \`${prefix}help ${
          closest(search, commands)
        }\`?`
      ).then(bot_msg => {
        bot_msg.delete({ timeout: 10000 });
      })
      .catch((err) => console.log(err));
  } else {
    return await message.channel
      .send(`Did you mean \`${prefix}help ${closest(message, commands)}\`?`)
      .then(bot_msg => {
        bot_msg.delete({ timeout: 10000 });
      })
      .catch((err) => console.log(err));
  }
}

module.exports.config = {
  name: 'help',
  aliases: ['help'],
  module: 'Utility',
  description:
    'I will send you this message, or the usage of a specific command.',
  usage: ['help', 'help command'],
};
