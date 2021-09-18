import { Meditations } from '../databaseFiles/connect';

export async function addToDatabase(userid, guildid, time) {
  var now = Date.now();

  await Meditations.insertOne({
    usr: userid,
    date: now,
    time: time,
    guild: guildid,
  });

  return true;
}

export async function getUserData(userid, guildid) {
  var meditation_count = await Meditations.countDocuments({
    $and: [{ usr: userid }, { guild: guildid }],
  });

  var meditation_sum = await Meditations.aggregate([
    {
      $match: {
        $and: [{ usr: userid }, { guild: guildid }],
      },
    },
    {
      $group: {
        _id: null,
        sum: {
          $sum: '$time',
        },
      },
    },
  ]).toArray();

  var meditation_time = 0;
  if (meditation_sum.length > 0) meditation_time = meditation_sum[0].sum;

  var streak = await getStreak(userid);

  return {
    meditation_count,
    meditation_time,
    streak,
  };
}

export async function getStreak(userid) {
  var streaks = await Meditations.aggregate([
    {
      $match: {
        usr: userid,
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

  var streak = 0;

  if (streaks && streaks[0]) {
    streaks[0]['days'].every(async (day) => {
      if (day !== streak) return false;

      streak++;
      return true;
    });
  }

  return streak;
}

export async function getGuildData(guildid) {
  var meditation_count = await Meditations.countDocuments({
    guild: guildid,
  });

  var meditation_time = await Meditations.aggregate([
    {
      $match: {
        guild: guildid,
      },
    },
    {
      $group: {
        timeTotal: { $sum: '$time' },
      },
    },
  ]);

  var meditation_sum = await Meditations.aggregate([
    {
      $match: {
        guild: guildid,
      },
    },
    {
      $group: {
        _id: null,
        sum: {
          $sum: '$time',
        },
      },
    },
  ]).toArray();

  var meditation_time = 0;
  if (meditation_sum.length > 0) meditation_time = meditation_sum[0].sum;

  return {
    meditation_count,
    meditation_time,
  };
}
