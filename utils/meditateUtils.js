const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Meditations = require('../databaseFiles/connect').Meditations;

async function addToDatabases(author, guildid, time) {
  var now = Date.now();

  var usr = await MeditationModel.findOne({usr: author.id});
  var all_time = 0;

  if (usr && usr.all_time) {
    all_time = usr.all_time;
  }

  all_time = all_time + time;

  MeditationModel.updateOne(
    { usr: author.id },
    { $set: {
        usr: author.id,
        last_time: time,
        all_time: all_time
      }
    },
    {
      upsert: true
    }
  );

  Meditations.insertOne(
    {
      usr: author.id,
      date: now,
      time: time
    }
  )

  var mettime = GuildModel.findOne({guild: guildid});
    var meditation_time = 0;
    var meditation_count = 0;

    if (mettime) {
      meditation_time = parseInt(mettime.meditation_time);
      meditation_count = parseInt(mettime.meditation_count);
    }

    meditation_time = meditation_time + time;
    meditation_count = meditation_count + 1;
    
    GuildModel.updateOne(
      { guild: guildid },
      { $set: {
          guild: guildid,
          meditation_time: meditation_time,
          meditation_count: meditation_count
        }
      },
      {
        upsert: true
      }
  );

  return meditation_count, meditation_time;
}

module.exports.addToDatabases = addToDatabases;