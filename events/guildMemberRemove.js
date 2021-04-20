const config = require('../config.json');
const Discord = require('discord.js');

module.exports = async (client, member) => {
  if(member.user.bot) return;

  const embed = new Discord.MessageEmbed()
    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL())
    .setTitle(`Member Left`)
    .setDescription(`We wish you well on your future endeavors ${member.user.username}#${member.user.discriminator}. :pray:`)
    .setColor(config.colors.embedColor);
  client.channels.cache.get(config.channels.welcome).send(embed);
};