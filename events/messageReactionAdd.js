const reportActions = require('../eventActions/reportAction');

module.exports = async (client, reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not, and return because this event will be fired by raw
	if (reaction && reaction.partial) {
		return;
	}

	// Check if user is reporting a message
	reportActions.checkReport(client, user, reaction);
};
