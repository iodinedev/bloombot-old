const Prefixes = require('../databaseFiles/connect').Prefixes;

module.exports.execute = async (client, message, args) => {
  args = args[0];

  if (!args) return await message.channel.send(':x: Please include a prefix you wish to use.');
  if (args.length > 2) return await message.channel.send(':x: Your prefix must not be longer than two characters.');

  var exists = await Prefixes.findOne({'guild': message.guild.id});

  if (!exists) {
    prefixObject = {
      guild: message.guild.id,
      prefix: args
    }
    
    await Prefixes.insertOne(prefixObject);
  } else {
    Prefixes.updateOne(
      { 'guild': message.guild.id },
      { $set: { 'prefix': args } },
      { upsert: true }
    )
  }

  return await message.channel.send(`:white_check_mark: Success! New prefix is \`${args}\`.`)
};

module.exports.config = {
  name: 'prefix',
  aliases: ['setprefix'],
  module: 'Settings',
  description: 'Change the prefix for the bot.',
  usage: ['prefix <new prefix>'],
  admin: true
};