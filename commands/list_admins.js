const ServerSetup = require('../databaseFiles/connect').ServerSetup;
const Discord = require('discord.js');
const config = require('../config.json');

module.exports.execute = async (client, message) => {
  var admins = await ServerSetup.findOne({
    guild: message.guild.id
  });

  if (!admins || !admins.admins) return await message.channel.send(':x: This server has no custom admins.');

  var pretty = "";

  admins.admins.forEach(admin => {
    pretty = pretty + `\n - \`${admin}\``;
  });

  let helpMessage = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle('List of Global Admins')
    .setDescription(pretty);

  return await message.channel.send(helpMessage);
};

module.exports.config = {
  name: 'listadmins',
  aliases: ['listadmin', 'admins'],
  module: 'Admin',
  description: 'Lists global admins in the database.',
  usage: ['listadmins'],
  admin: true
};
