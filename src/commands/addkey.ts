import { Keys } from '../databaseFiles/connect';

export const execute = async (client, message, args) => {
  if (!(args.length > 0))
    return await message.channel.send(
      ':x: You must include a key to be added.'
    );

  try {
    await message.channel.send(
      `\`${args[0]}\` will be added to the database. Is this correct? (Type 'yes' or 'no')`
    );
    const filter = (m) => m.author.id === message.author.id;

    const is_valid = message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
    });

    is_valid.on('collect', async (d) => {
      if (d.author.id !== message.author.id) return;
      is_valid.stop();

      var resp = d.content.trim();

      if (resp === 'yes') {
        var documents: {
          text: String,
          valid: Boolean
        }[] = [];

        args.forEach((element: any) => {
          documents.push({
            text: element,
            valid: true
          })
        });

        await Keys.insertMany(documents);

        return await message.channel.send('✅ Success!');
      } else if (resp === 'no') {
        return await message.channel.send(
          '❌ Cancelled. Nothing has been added to the database.'
        );
      } else {
        return await message.channel.send(
          '⚠️ Unrecognized response; nothing has been added to the database.'
        );
      }
    });
  } catch (err) {
    return await message.channel.send(
      '❌ An error occured. Please try again later.'
    );
  }
};

export const architecture = {
  name: 'addkey',
  aliases: ['akey'],
  module: 'Admin',
  admin: true,
  description: 'Adds a steam key to the database for winners.',
  usage: ['addkey <key>'],
};
