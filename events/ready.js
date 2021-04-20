const config = require('../config.json');
const remind = require('../commands/remind');

module.exports = (client) => {
	remind.catchUp(client);
	setInterval(remind.scanForReminders, config.reminderScanInterval, client);

	console.log(`Running on ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`);
	client.user.setActivity(config.playing);
};
