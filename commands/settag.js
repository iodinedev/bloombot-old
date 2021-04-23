const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  if (!args || !args[0]) return await message.channel.send(':x: Must specify a tag!');

  var joined = args.join(' ');

  var tag = joined.match(/'([^']+)'/);
  if (tag === null) tag = joined.match(/"([^"]+)"/);
  if (tag) tag = tag[1];
  else return await message.channel.send(':x: Must include a tag surrounded in quotes.')

  var def = joined.split(tag)[1];

  try {
    def = def.split('"').join('').split('\'').join('').trim();
  } catch(err) {
    console.error(err);
    return await message.channel.send(':x: Must include a definition.');
  }

  if (tag.split(" ").length > 1) return await message.channel.send(':x: Tags must not contain spaces.');

  const check_tag = await Tags.findOne({
    tag: tag
  });

  if (check_tag) await message.channel.send(':warning: That term is already defined. Definition will be updated.');

  await Tags.updateOne(
    { tag: tag },
    { $set: {
        tag: tag,
        def: def
      }
    },
    {
      upsert: true
    }
  );

  var db_tag = await Tags.findOne({
    tag: tag
  });

  const tagHelp = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle(`\`${db_tag.tag}\` Added to Glossary`)
    .addField(
      'Definition',
      `\`${db_tag.def}\``
    )
    .setFooter(`Tag ID: ${db_tag._id}`);
    
  return await message.channel.send(tagHelp);
};

module.exports.config = {
  name: 'settag',
  aliases: [],
  module: 'Utility',
  description: 'Sets a tag definition.',
  usage: ['settag <tag>'],
  admin: true,
};
