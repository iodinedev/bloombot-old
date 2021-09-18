import { Current } from '../databaseFiles/connect';

export const execute = async (client, message) => {
  var usr = await Current.findOne({
    usr: message.author.id,
  });

  if (!usr)
    return await message.channel.send(':x: You are not currently meditating.');

  const currentDate = new Date().getTime();

  let difference;
  difference = usr.whenToStop - currentDate;
  difference = new Date(difference).getMinutes();

  return await message.channel.send(
    `:clock1: You have **${difference}** minutes left!`
  );
};

export const architecture = {
  name: 'timeleft',
  aliases: ['time'],
  module: 'Meditation',
  description:
    'Check how much time is left for your current meditaiton session.',
  usage: ['timeleft'],
};
