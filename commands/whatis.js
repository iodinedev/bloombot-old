const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a tag!');

  const tag = await Tags.findOne({
    tag: args[0]
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
    if (result.length > 0) {
      if (distance(args[0], closest(args[0], result)) <= 5) {
        const tagHelp = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle('Tag Not Found')
          .addField('Did You Mean', closest(message, result))
        
        return message.channel.send(tagHelp);
      }
    }
  });

  return await message.channel.send(':x: Tag not found!');
};

module.exports.config = {
  name: 'whatis',
  aliases: ['define'],
  module: 'Utility',
  description: 'Shows you a description of a term in our glossary.',
  usage: ['whatis <tag>'],
};
