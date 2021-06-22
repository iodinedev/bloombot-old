const starboardActions = require('../eventActions/starboardActions');

module.exports = async (client, reaction, user) => {
  // When we receive a reaction we check if the reaction is partial or not, return because raw should fire this event
	if (reaction.partial) {
		return;
  }

  starboardActions.removeStar(client, user, reaction);
};