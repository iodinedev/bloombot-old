const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Meditations = require('../databaseFiles/connect').Meditations;
const Current = require('../databaseFiles/connect').Current;
const config = require('../config.json');

module.exports.execute = async (client, message) => {
  var voiceChannel = message.member.voiceChannel;

  if (voiceChannel) {
    var time = parseInt(args[0]);
    var curr = new Date.now();
    var link = config.meditation_sound;

    try {
      var usr = Current.findOne({
        usr: message.author.id
      });
    } catch(err) {
      console.error('Meditate MongoDB error: ', err);
    }

    if (usr) return await message.channel.send(':x: You are already meditating!');

    begin(message, voiceChannel, link);

    try {
      Current.insertOne({
        usr: message.author.id,
        time: time,
        curr: curr
      });
    } catch(err) {
      console.error('Meditation MongoDB error: ', err);
    }
  } else {
    return await message.channel.send(":x: You need to be in a voice channel to execute this command.");
  }
};

function begin(message, voiceChannel, link) {
  try {
    voiceChannel.join().then(connection => {
      const dispatcher = connection.playFile(link);
      dispatcher.on('end', end => {
        voiceChannel.leave();
      });
    }).catch(err => console.log(err))
  } catch(err) {
    return message.channel.send(':x: Could not connect to that channel.');
  }
}

async function stop(client, date, meditation, catchUp = false) {
	let userToStop = await client.users.fetch(meditation.usr);
	let color, description;

	if (catchUp) {
		color = '#FF4500';
		description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you have finished your **${meditation.time}** minutes of meditation, with an additional `;
	} else {
		color = '#FFCC00';
		description = `Hello! I'm sorry to barge in like that. 🤐
		I just wanted to remind you to **${reminder.whatToRemind}**. Off I go. 😄`;
	}

	const remindMessage = new Discord.MessageEmbed()
		.setColor(color)
		.setTitle(`${config.emotes.reminders} Reminder ${config.emotes.reminders}`)
		.setDescription(description);

	userToRemind.send(remindMessage);

	if (!reminder.recurring) {
		try {
			await Reminder.deleteOne({
				id: reminder._id
			});
		} catch(err) {
			console.error('Reminder MongoDB error: ', err);
		}
	} else {
		let [amountToAdd, whatToAdd] = reminder.howOftenToRemind.split(' ');
		amountToAdd = parseInt(amountToAdd);
		try {
			await Reminder.updateOne(
				{ id: reminder._id },
				{ $set: { whenToRemind: remindUtils.addToDate(date, amountToAdd, whatToAdd) } }
			);
		} catch(err) {
			console.error('Reminder MongoDB error: ', err);
		}
	}
}

async function scanForMeditations(client) {
	const currentDate = new Date();

	try {
		const meditations = await Current.find();

		if (meditations) {
			let difference;
			meditations.forEach(async meditation => {
				difference = currentDate - meditation.whenToRemind;
				if (difference > (-1)*config.meditationScanInterval) {
					stop(client, currentDate, meditation, difference);
				}
			});
		}
	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
	}
}

async function catchUp(client) {
	const currentDate = new Date();
	
	try {
		const meditations = await Current.find();
		
		if (meditations) {
			let difference;
			meditations.forEach(async meditation => {
				difference = currentDate - meditation.whenToRemind;
				if (difference > 0) {
					stop(client, currentDate, meditation, difference, true);
				}
			});
		}
	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
	}
}

module.exports.scanForMeditations = scanForMeditations;
module.exports.catchUp = catchUp;

module.exports.config = {
  name: 'meditate',
  aliases: ['hey', 'greetings'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};
