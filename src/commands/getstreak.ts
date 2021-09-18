import { Meditations } from '../databaseFiles/connect';

export const execute = async (client, message) => {
  var streaks = await Meditations.aggregate([
    {
      $match: {
        usr: message.author.id,
      },
    },
    {
      $project: {
        usr: '$usr',
        day: {
          $trunc: [
            {
              $add: [
                {
                  $divide: [
                    {
                      $subtract: [Date.now(), '$date'],
                    },
                    86400000,
                  ],
                },
                0.5,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: {
        day: 1,
      },
    },
    {
      $group: {
        _id: '$usr',
        days: {
          $push: '$day',
        },
      },
    },
  ]).toArray();

  var i = 0;

  if (streaks && streaks[0]) {
    streaks[0]['days'].every(async (day) => {
      if (day !== i) return false;

      i++;
      return true;
    });
  }

  return await message.channel.send(i);
};

export const architecture = {
  name: 'getstreak',
  aliases: ['streak'],
  module: 'Meditation',
  description: "Check how many days you've meditated for in a row.",
  usage: ['getstreak'],
};
