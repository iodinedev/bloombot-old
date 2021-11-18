import config from '../config';
import * as meditation from '../commands/meditate';
import { Keys, BotStats } from '../databaseFiles/connect';

export = async (client) => {
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
