import Discord from 'discord.js';
import config from '../config';
import { Prefixes } from '../databaseFiles/connect';
import { distance, closest } from 'fastest-levenshtein';

function capitalizeFLetter(input) {
  return input[0].toUpperCase() + input.slice(1);
}

export const execute = async (client, message, args) => {
  let commands = client.commands;
  var modules = config.modules;
  var cleanmodules = modules.map((v) => v.toLowerCase());
  let commandNames: any = [];

  let prefix;
  try {
    prefix = await Prefixes.findOne({ guild: message.guild.id });
    prefix = prefix.prefix;
  } catch {
    prefix = '.';
  }

  if (!args || args.length === 0) {
    var modulelist = '';

    let helpMessage = new Discord.MessageEmbed();
    helpMessage.color = config.colors.embedColor;
    helpMessage.title = 'List of available modules';
    helpMessage.description = `Modules available in ${message.guild.name}. Use \`${prefix}help [module]\` for more about a specific module.`;
    modules.forEach((module) => {
      modulelist = modulelist.concat(`${module}\n`);
    });
    try {
      helpMessage.fields.push({
        name: `All Modules`,
        value: `${modulelist}`,
        inline: false,
      });
      return await message.channel.send(helpMessage).then((bot_msg) => {
        deleteMessages(message, bot_msg);
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
      let helpMessage = new Discord.MessageEmbed();
      helpMessage.color = config.colors.embedColor;
      helpMessage.title = `${prefix}${command.config.name}`;
      helpMessage.description = `You asked for information on \`${prefix}${command.config.name}\``;

      const fields = [
        {
          name: 'Description:',
          value: command.config.description,
          inline: false,
        },
        {
          name: 'Aliases:',
          value:
            command.config.aliases.length > 0 ? command.config.aliases : 'None',
          inline: false,
        },
        {
          name: 'Usage:',
          value: command.config.usage,
          inline: false,
        },
      ];

      helpMessage.fields.push(...fields);

      try {
        message.channel.send(helpMessage).then((bot_msg) => {
          deleteMessages(message, bot_msg);
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      if (cleanmodules.includes(args[0].toLowerCase())) {
        var modCmd = args[0].toLowerCase(); // User input

        let helpMessage = new Discord.MessageEmbed();
        helpMessage.color = config.colors.embedColor;
        helpMessage.title = `${capitalizeFLetter(modCmd)}`;
        helpMessage.description = `You asked for commands under the ${modCmd} module.`;

        commands.forEach((requestedcommand) => {
          if (
            requestedcommand.config.module.toLowerCase() ==
            args[0].toLowerCase()
          ) {
            helpMessage.fields.push({
              name: `**${prefix}${requestedcommand.config.name}**`,
              value: `${requestedcommand.config.description}`,
              inline: false,
            });
          }
        });
        try {
          message.channel.send(helpMessage).then((bot_msg) => {
            deleteMessages(message, bot_msg);
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
        return didYouMean(commandNames, args[0].toLowerCase(), message, prefix);
      }
    }
  }
};

async function didYouMean(commands, search, message, prefix) {
  if (!commands.includes(search)) {
    return await message.channel
      .send(`Did you mean \`${prefix}help ${closest(search, commands)}\`?`)
      .then((bot_msg) => {
        deleteMessages(message, bot_msg);
      })
      .catch((err) => console.log(err));
  } else {
    return await message.channel
      .send(`Did you mean \`${prefix}help ${closest(message, commands)}\`?`)
      .then((bot_msg) => {
        deleteMessages(message, bot_msg);
      })
      .catch((err) => console.log(err));
  }
}

function deleteMessages(usr, bot) {
  usr.delete({ timeout: 15000 });
  bot.delete({ timeout: 15000 });
}

export const architecture = {
  name: 'help',
  aliases: ['help'],
  module: 'Utility',
  description:
    'I will send you this message, or the usage of a specific command.',
  usage: ['help', 'help command'],
};
