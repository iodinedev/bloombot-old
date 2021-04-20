const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');

module.exports.execute = async (client, message) => {
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
      
      return await message.channel.send(tagHelp);
    }
  });

  return await message.channel.send(':x: Tag not found!');
};

module.exports.config = {
  name: 'whatis',
  aliases: ['define'],
  module: 'Utility',
  description: 'Defines a preset tag.',
  usage: ['whatis <tag>'],
};
