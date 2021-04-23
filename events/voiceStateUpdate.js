const meditate_functions = require('../commands/meditate.js');
const Current = require('../databaseFiles/connect').Current;
const config = require('../config.json');

module.exports = async (client, oldState, newState) => {
	if (oldState.channelID && !newState.channelID) {
  const currentDate = new Date();
  const member = oldState.guild.members.cache.get(oldState.id);

	try {
		const meditation = await Current.findOne({
      usr: member.id
    });

		if (meditation) {
      let difference;
      difference = meditation.whenToStop - currentDate;

      difference = new Date(difference).getMinutes();     

      await Current.updateOne(
        { usr: member.id },
        { $set: {
            time: meditation.time - difference
          }
        }
      );


      const new_meditation = await Current.findOne({
        usr: member.id
      });

      meditate_functions.stop(client, new_meditation, difference);
		}
	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
	}
	}
}
