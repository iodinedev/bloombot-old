const config = require('../config.json');
const remind = require('../commands/remind');
const BotStats = require('../databaseFiles/connect').BotStats;

module.exports = (client) => {
	remind.catchUp(client);
	setInterval(remind.scanForReminders, config.reminderScanInterval, client);

	var now = Date.now();

	BotStats.updateOne(
		{ bot: client.user.id },
		{ $set: {
				bot: client.user.id,
				upSince: now,
			}
		},
		{
			upsert: true
		}
	);

	console.log(`Running on ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`);
	client.user.setActivity(config.playing);
};
