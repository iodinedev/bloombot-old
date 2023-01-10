import { prisma } from '../databaseFiles/connect';
import { reactionCheckAction } from '../eventActions/reactions';
import { Permissions } from 'discord.js';
import { isStaff } from '../utils/staffUtil';
import config from '../config';

export = async (client, message) => {
  if (message.author.bot) return;

  const args = message.content.split(/\s+/g); // Return the message content and split the prefix.

  var prefix;

  try {
    prefix = await prisma.serverSetup.findUnique({ where: { guild: message.guild.id }});
    prefix = prefix.prefix; // Get the 'prefix' string from the JSON object if found. If not will return error for trying to get null
  } catch {
    prefix = '.';
  }

  if (
    args[0] === `<@!${client.user.id}>` ||
    message.content.startsWith(`<@!${client.user.id}>`)
  ) {
    prefix = `<@!${client.user.id}>`;
    if (args[0] === prefix) {
      args.shift();
      args[0] = prefix + args[0]; // Dirty fix
    }
  }

  const command =
    message.content.startsWith(prefix) && args.shift().slice(prefix.length);

  if (command) {
    const commandfile =
      client.commands.get(command) ||
      client.commands.get(client.aliases.get(command));

    if (commandfile && commandfile.architecture.module !== "Hidden") {
      message.channel.sendTyping();

      const adminCommand: boolean = !!(commandfile.architecture.admin && commandfile.architecture.admin === true);
      const staffCommand: boolean = !!(commandfile.architecture.staff && commandfile.architecture.staff === true);

      const isPrivilegedCommand = adminCommand || staffCommand;

      const admin: boolean = !!(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
      const staff: boolean = !!(await isStaff(message, message.author.id));

      console.log(isPrivilegedCommand, admin, staff)

      // Check if user has Discord admin permissions or is in global admin database
      if (isPrivilegedCommand) {
        if (message.guild && !admin && !staff) {
          await message.channel.send(
            ":x: You don't have permission to run this command."
          );
        } else if (isPrivilegedCommand && !message.guild) {
          await message.channel.send(
            ":x: You can't run privileged commands in DMs."
          );
        } else {
          if (adminCommand && admin) {
            await commandfile.execute(client, message, args); // Execute found command
          } else if (staffCommand && ( staff || admin )) {
            await commandfile.execute(client, message, args); // Execute found command
          } else {
            await message.channel.send(
              ":x: You can't run privileged commands in DMs."
            );
          }
        }
      } else {
        await commandfile.execute(client, message, args); // Execute found command
      }
    } else if (commandfile && commandfile.architecture.module === "Hidden" && message.channel.type === "DM") {
      message.channel.sendTyping();

      await commandfile.execute(client, message, args); // Execute found command
    }
  }

  reactionCheckAction.checkIfCorrect(message);
};
