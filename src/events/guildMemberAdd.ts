import Discord, { ColorResolvable } from 'discord.js';
import config from '../config';

export = async (client, member) => {
  if (member.user.bot) return;

  const embed = new Discord.MessageEmbed();
  embed.title = `<:MeditationMind:694481715174965268> **Welcome to the Meditation Mind community!** <:MeditationMind:694481715174965268>`;
  embed.description = `Here are a few ideas to help get yourself settled in:
> • Read our community guidelines in <#430849808450846723>
> • Assign yourself roles in <#833740522345857044>
> • Introduce yourself to the community in <#428836907942936587>
> • If you're new to meditation and/or mindfulness, check out <#788697102070972427>
    
*Please note that the server uses Discord's Rules Screening feature.* You will need to agree to the rules to gain access to the server. If you don't see the pop-up, look for the notification bar at the bottom of your screen.
    
Thanks for joining us. We hope you enjoy your stay!`;
  embed.color = config.colors.embedColor;

  return await member.send({ embeds: [embed] }).catch((err) => {
    console.error(err);
  });
};
