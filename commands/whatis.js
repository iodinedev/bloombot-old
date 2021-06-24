const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const {distance, closest} = require('fastest-levenshtein');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a tag!');
  
  var regex = new RegExp(["^", args.join(' '), "$"].join(""), "i");

  const tag = await Tags.findOne({
    $or: [
      { search: args.join('').toLowerCase() },
      { aliases: {
        $in: [
          regex
        ]
      }}
    ]
  });

  if (tag) {
		const tagHelp = new Discord.MessageEmbed()
			.setColor(config.colors.embedColor)
			.setTitle(`${tag.tag}`)
			.addField(
        `Definition`,
        tag.def
      )
      .setFooter(`Category: ${tag.cat}`);

    if (tag.links) {
      tagHelp.addField(
        'Links',
        `${tag.links.join('\n')}`,
        true
      )
    }

    if (tag.aliases.length > 0) {
      tagHelp.addField(
        'Aliases',
        `${tag.aliases.join('\n')}`,
        true
      )
    }

    return await message.channel.send(tagHelp);
  }
  
  await Tags.find().toArray(async function(err, result) {
    if (result && result.length > 0) {
      var search = args.join(' ').toLowerCase();
      var close = closest(search, result);

      if (distance(search, close.search) <= 5 || (close.aliases.length > 0 && distance(search, closest(search, close.aliases)) <= 5)) {
        const tagHelp = new Discord.MessageEmbed()
          .setColor(config.colors.embedColor)
          .setTitle('Tag Not Found')
          .setDescription(`Did you mean \`${close.tag}\`?`)
        
        return await message.channel.send(tagHelp);
      }
    }

    return await message.channel.send(':x: Tag not found!');
  });
};

module.exports.config = {
  name: 'whatis',
  aliases: ['define'],
  module: 'Utility',
  description: 'Shows you a description of an individual term from our glossary.',
  usage: ['whatis <tag>'],
};
