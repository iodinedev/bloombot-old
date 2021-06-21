const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a tag!');

  const tag = await Tags.findOne({
    tag: args[0]
  });

  if (tag) {
		const tagHelp = new Discord.MessageEmbed()
			.setColor(config.colors.embedColor)
			.setTitle(`${tag.tag}`)
			.addField(
        `Definition`,
        tag.def
      )
      .addField(
        `Links`,
        tag.links
      )
      .setFooter(`Category: ${tag.cat}`);
    return await message.channel.send(tagHelp);
  }
  
  await Tags.find().toArray(function(err, result) {
    if (result.length > 0) {
      if (distance(args[0], closest(args[0], result)) <= 5) {
        const tagHelp = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle('Tag Not Found')
          .setDescription(`Did you mean \`${closest(message, result).tag}\`?`)
        
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
  description: 'Shows you a description of an individual term from our glossary.',
  usage: ['whatis <tag>'],
};
