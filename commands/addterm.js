const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  const timeout = async (messages) => {
    if (messages.size === 0) return await message.channel.send(':x: Command timed out.')
  }


  try {
    await message.channel.send('Please send the name of the tag...')

    const filter = m => m.author.id === message.author.id
    const tag_collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 })

    tag_collector.on('collect', async (t) => {
      var tag = t.content.trim()
        
      const check_tag = await Tags.findOne({
        tag: tag
      });
    
      if (check_tag) await message.channel.send(':warning: That term is already defined. Definition will be updated. Wait for the bot to alert you the command has timed out (15 seconds) to cancel.');

      await message.channel.send('Please send the description of the tag...')
  
      const def_collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 })

      def_collector.on('collect', async (d) => {
        var def = d.content.trim()

        await message.channel.send('Please send the links of the tag (optional, use \'none\' without quotes to skip). Seperate multiple links with commas...')

        const links_collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 })

        links_collector.on('collect', async (l) => {
          var links = l.content.split(',')

          links = links[0] === 'none' ? '' : links

          await message.channel.send('Please send the category of the tag...')

          const cat_collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000 })

          cat_collector.on('collect', async (c) => {
            var category = c.content.trim()

            await Tags.updateOne(
              { tag: tag },
              { $set: {
                  tag: tag,
                  def: def,
                  links: links,
                  cat: category
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
                `\`${db_tag.def}\``,
                true
              )
              .addField(
                'Category',
                `\`${db_tag.cat}\``,
                true
              )
              .setFooter(`Tag ID: ${db_tag._id}`);

            if (db_tag.links) {
              tagHelp.addField(
                'Links',
                `\`${db_tag.links}\``,
                true
              )
            }
              
            return await message.channel.send(tagHelp);
          })

          cat_collector.on('end', async (c) => {
            timeout(c)
          })
        })

        links_collector.on('end', async (l) => {
          timeout(l)
        })
      });

      def_collector.on('end', async (d) => {
        timeout(d)
      });
    });
    
    tag_collector.on('end', async (t) => {
      timeout(t)
    });
  } catch(err) {
    console.error(err);
    return await message.channel.send(':x: Must include a definition.');
  }
};

module.exports.config = {
  name: 'addterm',
  aliases: [],
  module: 'Admin',
  description: 'Sets a term\'s definition with an interactive walkthrough.',
  usage: ['addterm'],
  admin: true,
};
