import { Keys } from '../databaseFiles/connect';
import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message, args) => {
  var page = 0;
  var pages = await pageNumbers();

  var menuEmbed = await createMenu(page, pages);

  if (!menuEmbed)
    return await message.channel.send(':x: No keys have been added yet.');

  var menu = await message.channel.send({ embeds: [menuEmbed] });
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

        menu.edit({ embeds: [menuEmbed] });

        menu.reactions.removeAll();
      })
      .catch((err) => {
        menu.reactions.removeAll();
        active = false;
      });
  }
};

async function createMenu(page, pages) {
  var selected = await Keys.aggregate([
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
  menuEmbed.title = 'Keys';
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
  var count = await Keys.countDocuments();

  return Math.ceil(count / 9);
}

export const architecture = {
  name: 'listkeys',
  aliases: ['lkey'],
  module: 'Admin',
  admin: true,
  description: 'Lists all steam keys in the database.',
  usage: ['listkeys [page]'],
};
