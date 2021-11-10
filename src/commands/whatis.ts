import { Tags } from '../databaseFiles/connect';
import config from '../config';
import { distance, closest } from 'fastest-levenshtein';
import Discord from 'discord.js';

export const execute = async (client, message, args) => {
  if (!args[0])
    return await message.channel.send(':x: You must include a tag!');

  var regex = new RegExp(['^', args.join(' '), '$'].join(''), 'i');

  const tag = await Tags.findOne({
    $or: [
      { search: args.join('').toLowerCase() },
      {
        aliases: {
          $in: [regex],
        },
      },
    ],
  });

  if (tag) {
    const tagHelp = new Discord.MessageEmbed();
    tagHelp.color = config.colors.embedColor;
    tagHelp.title = `${tag.tag}`;
    tagHelp.fields.push({
      name: `Definition`,
      value: tag.def,
      inline: false,
    });
    tagHelp.footer = { text: `Category: ${tag.cat}` };

    if (tag.links) {
      tagHelp.fields.push({
        name: 'Links',
        value: `${tag.links.join('\n')}`,
        inline: true,
      });
    }

    if (tag.aliases && tag.aliases.length > 0) {
      tagHelp.fields.push({
        name: 'Aliases',
        value: `${tag.aliases.join('\n')}`,
        inline: true,
      });
    }

    return await message.channel.send({ embeds: [tagHelp] });
  }

  await Tags.find().toArray(async function (err, result) {
    if (result && result.length > 0) {
      var search = args.join(' ').toLowerCase();
      var close;
      var closelen = search.length;

      result.forEach(async (term) => {
        var termlen = distance(search, term.search);

        if (termlen < closelen) {
          close = term;
          closelen = termlen;
        }
      });

      if (
        close &&
        (distance(search, close.search) <= 5 ||
          (close.aliases &&
            close.aliases.length > 0 &&
            distance(search, closest(search, close.aliases)) <= 5))
      ) {
        const tagHelp = new Discord.MessageEmbed();
        tagHelp.color = config.colors.embedColor;
        tagHelp.title = 'Tag Not Found';
        tagHelp.description = `Did you mean \`${close.tag}\`?`;

        return await message.channel.send({ embeds: [tagHelp] });
      }
    }

    return await message.channel.send(':x: Tag not found!');
  });
};

export const architecture = {
  name: 'whatis',
  aliases: ['define'],
  module: 'Utility',
  description:
    'Shows you a description of an individual term from our glossary.',
  usage: ['whatis <tag>'],
};
