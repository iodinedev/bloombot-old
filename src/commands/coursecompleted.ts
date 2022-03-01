import config from "../config";

export const execute = async (client, message) => {
  await client.guilds.cache.fetch();
  const guild = client.guilds.cache.get("244917432383176705");
  console.log(guild)
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
