const Tags = require('../databaseFiles/connect').Tags;
const config = require('../config.json');
const Discord = require('discord.js');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a tag!');

  const timeout = async (messages) => {
    if (messages.size === 0) return await message.channel.send(':x: Command timed out.')
  }

  const tag = await Tags.findOne({
    search: args.join('').toLowerCase()
  })

  try {
    await message.channel.send(`:warning: Delete the tag **${tag.tag}**? Reply \`yes\` to confirm or ignore this to deny.`)

    const filter = m => m.author.id === message.author.id
    const tag_collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000 })

    tag_collector.on('collect', async (t) => {
      if (t.content.toLowerCase() === 'yes') {
        const deletetag = await Tags.deleteOne({
          tag: tag.tag
        });
      
        if (deletetag) {
          return await message.channel.send(':white_check_mark: Term deleted.')
        }
      
        return await message.channel.send(':x: Tag not found!');
      }
    })
  } catch(err) {
    return console.error(err)
  }
};

module.exports.config = {
  name: 'removeterm',
  aliases: ['destroyitcastitintothefire', 'deleteterm'],
  module: 'Admin',
  description: 'Removes a term from the glossary.',
  usage: ['removeterm <term>'],
  admin: true,
};
