import config from '../config';
import Discord from 'discord.js';

export = async (client, member) => {
  if (member.user.bot) return;

  const embed = new Discord.MessageEmbed();
  embed.author = {
    name: `${member.user.username}#${member.user.discriminator}`,
    url: member.user.displayAvatarURL(),
  };
  embed.title = `Member Left`;
  embed.description = `We wish you well on your future endeavors ${member.user.username}#${member.user.discriminator}. :pray:`;
  embed.color = config.colors.embedColor;
  client.channels.cache.get(config.channels.welcome).send({ embeds: [embed] });
};
