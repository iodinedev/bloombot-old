const oldMeditations = require('../meditations.json');


module.exports.execute = async (client, message) => {
  var result = getUser(message.author.id);

  if (!result) return await message.channel.send(':x: You have no old data.');

  return await message.channel.send(
    `**Time**: ${result[0].all_time}`
  );
};

function getUser(userid) {
  return oldMeditations.filter(
    function(oldMeditations){ return oldMeditations.uid == userid }
  );
}

module.exports.config = {
  name: 'oldstats',
  aliases: ['oldstats'],
  module: 'Meditation',
  description: 'Shows how many minutes you meditated for before the rewrite.',
  usage: ['oldstats'],
};
