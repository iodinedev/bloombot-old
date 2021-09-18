import Discord from 'discord.js';
import config from '../config';

export const execute = async (client, message, args) => {
  var joined = args.join(' ');

  var suggestTitle = joined.match(/'([^']+)'/);
  if (suggestTitle === null) suggestTitle = joined.match(/"([^"]+)"/);
  if (suggestTitle) suggestTitle = suggestTitle[1];
  else
    return await message.channel.send(
      ':x: Must include a title surrounded in quotes.'
    );

  var suggestDesc = joined.split(suggestTitle)[1];

  try {
    suggestDesc = suggestDesc.split('"').join('').split("'").join('').trim();
  } catch (err) {
    console.error(err);
    return await message.channel.send(':x: Must include a description.');
  }

  if (suggestDesc.length > 1000)
    return await message.channel.send(
      ':x: Suggestions must not be longer than one thousand characters.'
    );

  await confirmSuggestion(suggestTitle, suggestDesc, message);
};

async function confirmSuggestion(suggestTitle, suggestDesc, message) {
  let confirmation_message = await message.channel.send(`
Hey ${message.author.username}! Please confirm if this is correct.
Do you want me to suggest \`${suggestTitle}\`?
> \`${suggestDesc}\`
React with thumbs up or thumbs down!
**Please note that this message will disappear in 20 seconds.**`);

  let confirm, deny;
  [confirm, deny] = [config.emotes.confirm, config.emotes.deny];

  confirmation_message
    .react(confirm)
    .then(() => confirmation_message.react(deny));

  const filter = (reaction, user) => {
    return (
      [confirm, deny].includes(reaction.emoji.name) &&
      user.id === message.author.id
    );
  };

  confirmation_message
    .awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
    .then((collected) => {
      const reaction = collected.first();

      confirmation_message.delete();

      if (reaction.emoji.name === confirm) {
        postReminder(suggestTitle, suggestDesc, message);
      } else if (reaction.emoji.name === deny) {
        return message.channel.send(':x: Suggestion cancelled.');
      }
    })
    .catch((err) => {
      confirmation_message.delete();
      return message.reply(
        "You didn't confirm nor deny. Please try again or use `.suggest help` for guidance!"
      );
    });
}

async function postReminder(suggestTitle, suggestDesc, message) {
  var suggestion_channel = message.guild.channels.cache.get(
    config.channels.suggestions
  );

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1;
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  if (suggestion_channel) {
    var suggestEmbed = new Discord.MessageEmbed();
    suggestEmbed.color = config.colors.embedColor;
    suggestEmbed.title = suggestTitle;
    suggestEmbed.description = suggestDesc;
    suggestEmbed.footer = {
      text: `Suggestion by ${message.author.username}#${message.author.tag} on ${day}/${month}/${year}.`,
    };

    var suggestion = suggestion_channel.send({embeds: [ suggestEmbed ]});

    await suggestion.react(config.emotes.upvote);
    await suggestion.react(config.emotes.downvote);
  }
}

export const architecture = {
  name: 'suggest',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};
