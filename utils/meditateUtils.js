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
    usr: userid,
    guild: guildid
  });

  var meditation_time = await Meditations.aggregate([ {
    $group: {
       _id: null,
       "TotalCount": {
          $sum:1
       }
    }
    } ], function(err, result) {
      console.log(result);
});

  console.log(meditation_time)

  return meditation_count, meditation_time;
}

async function getGuildData(guildid) {
  var meditation_count = await Meditations.countDocuments({
    guild: guildid
  });

  console.log(meditation_count);

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
  ]).timeTotal;

  return meditation_count, meditation_time;
}

module.exports.addToDatabase = addToDatabase;
module.exports.getUserData = getUserData;
module.exports.getGuildData = getGuildData;