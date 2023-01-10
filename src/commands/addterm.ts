import { prisma } from '../databaseFiles/connect';
import config from '../config';
import Discord from 'discord.js';

export const execute = async (client, message, args) => {
  const timeout = async (messages) => {
    if (messages.size === 0)
      return await message.channel.send(':x: Command timed out.');
  };

  try {
    await message.channel.send('Please send the name of the tag...');

    const filter = (m) => m.author.id === message.author.id;
    const tag_collector = message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
    });

    tag_collector.on('collect', async (t) => {
      var tag = t.content.trim();

      const check_tag = await prisma.tags.findFirst({
        where: {
          OR: [
            { search: tag.split(' ').join('').toLowerCase() },
            {
              aliases: {
                has: tag.toLowerCase().split(' ')
              },
            },
          ],
        }
      });

      if (check_tag)
        await message.channel.send(
          ':warning: That term is already defined. Definition will be updated. Wait for the bot to alert you the command has timed out (15 seconds) to cancel.'
        );

      await message.channel.send('Please send the description of the tag...');

      const def_collector = message.channel.createMessageCollector(filter, {
        max: 1,
        time: 30000,
      });

      def_collector.on('collect', async (d) => {
        var def = d.content.trim();

        await message.channel.send(
          "Please send the links of the tag (optional, use 'none' without quotes to skip). Seperate multiple links with commas..."
        );

        const links_collector = message.channel.createMessageCollector(filter, {
          max: 1,
          time: 30000,
        });

        links_collector.on('collect', async (l) => {
          var links = l.content.split(',');

          links = links[0] === 'none' && links.length === 1 ? '' : links;

          await message.channel.send('Please send the category of the tag...');

          const cat_collector = message.channel.createMessageCollector(filter, {
            max: 1,
            time: 30000,
          });

          cat_collector.on('collect', async (c) => {
            var category = c.content.trim();

            await message.channel.send(
              "Please send the aliases of the tag (optional, use 'none' without quotes to skip). Seperate multiple entries with commas..."
            );

            const aliases_collector = message.channel.createMessageCollector(
              filter,
              { max: 1, time: 30000 }
            );

            aliases_collector.on('collect', async (a) => {
              var aliases = a.content.trim().split(',');

              aliases =
                aliases[0] === 'none' && aliases.length === 1 ? [] : aliases;

              if (check_tag) {
                await prisma.tags.update({
                  where: {
                    tag: tag
                  },
                  data: {
                    tag: tag,
                    search: tag.split(' ').join('').toLowerCase(),
                    def: def,
                    links: links,
                    cat: category,
                    aliases: aliases,
                  }
                });
              } else {
                await prisma.tags.create({
                  data: {
                    tag: tag,
                    search: tag.split(' ').join('').toLowerCase(),
                    def: def,
                    links: links,
                    cat: category,
                    aliases: aliases,
                  }
                });
              }

              var db_tag = await prisma.tags.findUnique({
                where: {
                  tag: tag,
                }
              });

              if (!db_tag)
                return await message.channel.send(
                  ':x: There was an error adding the tag to the database.'
                );

              const tagHelp = new Discord.MessageEmbed();
              tagHelp.color = config.colors.embedColor;
              tagHelp.title = `\`${db_tag.tag}\` Added to Glossary`;
              tagHelp.fields = [
                {
                  name: 'Definition',
                  value: `\`${db_tag.def}\``,
                  inline: true,
                },
              ];
              tagHelp.footer = { text: `Category: ${db_tag.cat}` };

              if (db_tag.links) {
                tagHelp.fields.push({
                  name: 'Links',
                  value: `${db_tag.links.join('\n')}`,
                  inline: true,
                });
              }

              if (db_tag.aliases.length > 0) {
                tagHelp.fields.push({
                  name: 'Aliases',
                  value: `${db_tag.aliases.join('\n')}`,
                  inline: true,
                });
              }

              return await message.channel.send({ embeds: [tagHelp] });
            });

            aliases_collector.on('end', async (a) => {
              timeout(a);
            });
          });

          cat_collector.on('end', async (c) => {
            timeout(c);
          });
        });

        links_collector.on('end', async (l) => {
          timeout(l);
        });
      });

      def_collector.on('end', async (d) => {
        timeout(d);
      });
    });

    tag_collector.on('end', async (t) => {
      timeout(t);
    });
  } catch (err) {
    console.error(err);
    return await message.channel.send(':x: Must include a definition.');
  }
};

export const architecture = {
  name: 'addterm',
  aliases: [],
  module: 'Admin',
  description: "Sets a term's definition with an interactive walkthrough.",
  usage: ['addterm'],
  staff: true,
};
