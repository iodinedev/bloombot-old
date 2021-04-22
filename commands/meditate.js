const Current = require('../databaseFiles/connect').Current;
const meditateUtils = require('../utils/meditateUtils');
const config = require('../config.json');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

module.exports.execute = async (client, message, args) => {
  var voiceChannel = message.member.voice;

  if (voiceChannel) {
		if (!args || !args[0]) {
			return await message.channel.send(':x: You must specify how long you\'d like to meditate for!');
		}

    var time = parseInt(args[0]);
		var curr = new Date();
    var stop = new Date(curr.getTime() + time * 60000).getTime();
    var link = config.meditation_sound;

    try {
      var usr = await Current.findOne({
        usr: message.author.id
      });
    } catch(err) {
      console.error('Meditate MongoDB error: ', err);
    }

		if (time > 180) return await message.channel.send(':x: You cannot meditate for longer than three hours at once.');
		if (usr) return await message.channel.send(':x: You are already meditating!');

    try {			
			begin(client, voiceChannel, link);
			
      Current.insertOne({
        usr: message.author.id,
        time: time,
        whenToStop: stop,
	guild: message.guild
}     );
    } catch(err) {
      console.error('Meditation MongoDB error: ', err);
    }
  } else {
    return await message.channel.send(":x: You need to be in a voice channel to execute this command.");
  }
};

function begin(client, voiceChannel, link) {
    voiceChannel.channel.join().then(connection => {
      const dispatcher = connection.play(ytdl(link, { quality: 'highestaudio' }));
      dispatcher.on('end', end => {
        voiceChannel.channel.leave();
      });
    }).catch(err => console.log(err));
}

async function stop(client, meditation, difference, catchUp = false) {
	let userToStop = await client.users.fetch(meditation.usr);
	let description;
	var time = meditation.time;

	if (catchUp) {
		description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you have finished your **${meditation.time}** minutes of meditation. I've added it to your total.`;
		time = time + difference;
	} else {
		description = `Hello! Your **${meditation.time}** minutes of meditation are done! I've added it to your total.`
	}

	meditateUtils.addToDatabases(userToStop, meditation.guild, time);

	const stopMessage = new Discord.MessageEmbed()
		.setColor(config.embed_color)
		.setTitle(`${config.emotes.meditation} Meditation Time Done ${config.emotes.meditation}`)
		.setDescription(description);

	userToStop.send(stopMessage);

	try {
		await Current.deleteOne({
			id: meditation._id
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
				difference = currentDate - meditation.whenToStop;
				console.log(difference);
				if (difference > (-1)*config.meditationScanInterval) {
					stop(client, meditation, difference);
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
				difference = currentDate - meditation.whenToStop;
				if (difference > 0) {
					stop(client, meditation, difference, true);
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
