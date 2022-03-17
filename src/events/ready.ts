import config from '../config';
import * as meditation from '../commands/meditate';

export = async (client) => {
  meditation.catchUp(client);
  setInterval(
    meditation.scanForMeditations,
    config.meditationScanInterval,
    client
  );

  console.log(
    `Running on ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`
  );
  client.user.setActivity(config.playing);
};
