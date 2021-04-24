const config = require('../config.json');
const Meditations = require('../databaseFiles/connect').Meditations;

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must specify a user to reset.');

  var id = args[0];
  
  await message.guild.members.fetch();

  var member = message.guild.members.cache.get(id);
  if (!member) return await message.channel.send(':x: This user does not exist.');

  var roles = member.roles;

  if(parseInt(id) === NaN) return await message.channel.send(':x: That is not a valid user ID.');

  await Meditations.deleteMany({
    $and: [
      {usr: userid},
      {guild: guildid}
    ]
  });

  await Object.values(config.roles.lvl_roles).every(async (roleid) => {
    if (roles.cache.has(roleid)) {
        var check_role = await roles.cache.find(role => role.id === roleid);

        roles.remove(check_role);
    }
  });

  if (roles.cache.has(config.roles.meditation_challenger)) { 
    var check_role = await roles.cache.find(role => role.id === config.roles.meditation_challenger);

    roles.remove(check_role);
  }

  return message.channel.send(':white_check_mark: User has been removed from all databases.');
};

module.exports.config = {
  name: 'resetstats',
  aliases: ['reset'],
  module: 'Admin',
  description: 'Resets a user\'s meditation stats.',
  usage: ['resetstats <user ID>'],
  admin: true,
};
