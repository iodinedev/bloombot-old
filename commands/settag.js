const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');

module.exports.execute = async (client, message, args) => {
  var joined = args.join(' ');

  var tag = joined.match(/'([^']+)'/)[1];
  var def = joined.split(tag)[0].strip();

  tag = tag.split('\'').join('').split('"').join(''); // Remove quotes

  if (tag.split(" ").length > 1) return await message.channel.send(':x: Tags must not contain spaces.');

  const check_tag = await Tags.findOne({
    tag: tag
  });

  if (check_tag) await message.channel.send(':warning: That term is already defined. Definition will be updated.');

  await Tags.insertOne({
    tags
  })

  MeditationModel.updateOne(
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

  const tagHelp = new Discord.MessageEmbed()
    .setColor(config.colors.embedColor)
    .setTitle(`\`${tag.title}\` Added to Glossary`)
    .addField(
      'Definition'
      `\`${def}\``
    )
    .setFooter(`Tag id: ${tag.tag}`);
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
