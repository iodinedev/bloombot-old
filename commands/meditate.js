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

async function stop(client, date, meditation, difference, catchUp = false) {
	let userToStop = await client.users.fetch(meditation.usr);
	let color, description;
	var time = meditation.time;

	if (catchUp) {
		description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you have finished your **${meditation.time}** minutes of meditation, with an additional time of **${difference}**. I've added it to your total.`;
		time = time + difference;
	} else {
		description = `Hello! Your **${meditation.time}** minutes of meditation are done! I've added it to your total.`
	}

	const stopMessage = new Discord.MessageEmbed()
		.setColor(config.embed_color)
		.setTitle(`${config.emotes.meditation} Meditation Time Done ${config.emotes.meditation}`)
		.setDescription(description);

	userToRemind.send(stopMessage);

	try {
		await Current.deleteOne({
			id: reminder._id
		});
	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
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
  aliases: [],
  module: 'Meditation',
  description: 'Keeps track of your meditation time for you. Join a voice channel and it will join and play a gong sound to mark the beginning and end.\nIt will leave in between the gong sounds, but you must stay in the voice channel or it will stop it early.',
  usage: ['meditate <time in minutes>'],
};
