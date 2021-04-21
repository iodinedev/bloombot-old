const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');

module.exports.execute = async (client, message, args) => {
  const tag = await Tags.findOne({
    tag: message
  });

  if (tag) {
		const tagHelp = new Discord.MessageEmbed()
			.setColor(config.colors.embedColor)
			.setTitle(tag.title)
			.setDescription(tag.description)
      .setFooter(`Tag id: ${tag.tag}`);
    return await message.channel.send(tagHelp);
  }
  
  await Tags.find().toArray(function(err, result) {
    if (distance(message, closest(message, result)) <= 5) {
      const tagHelp = new Discord.MessageEmbed()
        .setColor(config.colors.embedColor)
        .setTitle('Tag Not Found')
        .addField('Did You Mean', closest(message, result))
      
      return message.channel.send(tagHelp);
    }
  });

  return await message.channel.send(':x: Tag not found!');
};

module.exports.config = {
  name: 'settag',
  aliases: [],
  module: 'Utility',
  description: 'Sets a tag definition.',
  usage: ['settag <tag>'],
  admin: true,
};
