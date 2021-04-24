const Meditations = require('../databaseFiles/connect').Meditations;

async function addToDatabase(userid, guildid, time) {
  var now = Date.now();

  await Meditations.insertOne(
    {
      usr: userid,
      date: now,
      time: time,
      guild: guildid
    }
  );

  return true;
}

async function getUserData(userid, guildid) {
  var meditation_count = await Meditations.countDocuments({
    $and: [
      {usr: userid},
      {guild: guildid}
    ]
  });

  var meditation_sum = await Meditations.aggregate([ 
    { $match: {
      $and: [
        {usr: userid},
        {guild: guildid}
      ]
    } },
    {
      $group: {
        _id: null,
        "sum": {
            $sum: "$time"
        }
      }
    }
  ]).toArray();

  var meditation_time = 0
  if (meditation_sum.length > 0) meditation_time = meditation_sum[0].sum;

  return {
    meditation_count,
    meditation_time
  };
}

async function getGuildData(guildid) {
  var meditation_count = await Meditations.countDocuments({
    guild: guildid
  });

  var meditation_time = await Meditations.aggregate([
    {
      $match: {
        guild: guildid
      }
    },
    {
      $group: {
        timeTotal: { $sum: "$time" }
      }
    }
  ]);

  var meditation_sum = await Meditations.aggregate([ 
    { $match: {
      guild: guildid
    } },
    {
      $group: {
        _id: null,
        "sum": {
            $sum: "$time"
        }
      }
    }
  ]).toArray();



  var meditation_time = 0
  if (meditation_sum.length > 0) meditation_time = meditation_sum[0].sum;

  return {
    meditation_count,
    meditation_time
  };
}

module.exports.addToDatabase = addToDatabase;
module.exports.getUserData = getUserData;
module.exports.getGuildData = getGuildData;