import config from "../config";

export const execute = async (client, message) => {
  if (await message.member.roles.cache.find(r => r.id === config.roles.courseEnrolled)) {
    var role = await message.member.roles.cache.find(role => role.id === config.roles.courseCompleted);
    if (!role) return;
    await message.member.guild.roles.add(role);
  }
};

export const architecture = {
  name: 'coursecompleted',
  aliases: ['cc'],
  module: 'Hidden',
  description: 'Mark that you\'re done with the course. It\'s on the honor system, so make sure you\'re actually done with it!',
  usage: ['coursecompleted']
};
