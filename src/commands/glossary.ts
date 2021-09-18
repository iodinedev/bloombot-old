import { Tags } from '../databaseFiles/connect';
import config from '../config';
import Discord from 'discord.js';

export const execute = async (client, message) => {
  var page = 0;
  var pages = await pageNumbers();

  var menuEmbed = await createMenu(page, pages);

  if (!menuEmbed)
    return await message.channel.send(':x: No terms have been defined yet.');

  var menu = await message.channel.send({embeds: [ menuEmbed ]});
  var active = true;

  let back, forward;
  let allowed_back, allowed_forward;

  [back, forward] = ['◀️', '▶️'];

  while (active === true) {
    [allowed_back, allowed_forward] = [
      page > 0 ? true : false,
      pages - page > 1 ? true : false,
    ];

    if (allowed_back) await menu.react(back);
    if (allowed_forward) menu.react(forward);

    const filter = (reaction, user) => {
      return (
        [back, forward].includes(reaction.emoji.name) &&
        user.id === message.author.id
      );
    };

    await menu
      .awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
      .then(async (collected) => {
        if (collected.first()._emoji.name === forward) page = page + 1;
        else page = page - 1;

        menuEmbed = await createMenu(page, pages);

        menu.edit({embeds: [ menuEmbed ]});

        menu.reactions.removeAll();
      })
      .catch((err) => {
        menu.reactions.removeAll();
        active = false;
      });
  }
};

async function createMenu(page, pages) {
  var selected = await Tags.aggregate([
    {
      $group: {
        _id: '$cat',
        tags: {
          $push: '$tag',
        },
      },
    },
  ]).toArray();

  if (selected.length === 0) return false;

  let menuEmbed = new Discord.MessageEmbed();
  menuEmbed.color = config.colors.embedColor;
  menuEmbed.title = 'Glossary';
  menuEmbed.footer = { text: `Page ${page + 1} of ${pages}.` };

  await selected.forEach((term) => {
    menuEmbed.fields.push({
      name: term._id,
      value: term.tags.join('\n'),
      inline: true,
    });
  });

  return menuEmbed;
}

async function pageNumbers() {
  var count = await Tags.countDocuments();

  return Math.ceil(count / 9);
}

export const architecture = {
  name: 'glossary',
  aliases: ['list', 'terms'],
  module: 'Utility',
  description: 'Shows a list of all terms available in our glossary.',
  usage: ['glossary'],
};
