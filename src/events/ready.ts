import config from '../config';
import * as meditation from '../commands/meditate';
import { Keys, Meditations, Stars, BotStats, ServerSetup } from '../databaseFiles/connect';
import meditations from '../backups/meditations';
import serversetup from '../backups/serversetup';
import starboard from '../backups/starboard';
import botstats from '../backups/botstats';

export = async (client) => {
  console.log(meditations)
  console.log(serversetup)
  console.log(starboard)
  console.log(botstats)
  await Meditations.insertMany(meditations);
  await ServerSetup.insertMany(serversetup);
  await Stars.insertMany(starboard);
  await BotStats.insertMany(botstats);

  try {
    await Keys.createIndex( { text: 1 }, { unique: true } )
  } catch(err) {
    console.error(err);
  }

  meditation.catchUp(client);
  setInterval(
    meditation.scanForMeditations,
    config.meditationScanInterval,
    client
  );

  var now = Date.now();

  BotStats.updateOne(
    { bot: client.user.id },
    {
      $set: {
        bot: client.user.id,
        upSince: now,
      },
    },
    {
      upsert: true,
    }
  );

  console.log(
    `Running on ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`
  );
  client.user.setActivity(config.playing);
};
