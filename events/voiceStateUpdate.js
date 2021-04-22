const meditation = require('../commands/meditate.js');
const Current = require('../databaseFiles/connect').Current;
const config = require('../config.json');

module.exports = async (client, oldMember, newMember) => {
  const currentDate = new Date();

	try {
		const meditation = await Current.findOne({
      usr: newMember.id
    });

		if (meditation) {
      let difference;
      difference = currentDate - meditation.whenToStop;

      difference = difference.getMinutes();

      await Current.updateOne(
        { usr: newMember.id },
        { $set: {
            time: difference
          }
        }
      );

      meditation.stop(client, meditation, difference);
		}
	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
	}
}
