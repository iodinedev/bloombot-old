const Current = require('../databaseFiles/connect').Current;
const meditateUtils = require('../utils/meditateUtils');
const config = require('../config.json');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

module.exports.execute = async (client, message, args) => {
  var voiceChannel = message.member.voice;

  if (voiceChannel.channel) {
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
			await voiceChannel.channel.leave();
		} catch(err) {
			console.error(err);
		}

    try {			
			begin(client, voiceChannel.channel, link);

			const meditators = [];
			var curr_role = await message.member.guild.roles.cache.find(role => role.id === config.roles.currently_meditating);

			for (const [memberID, vc_member] of voiceChannel.channel.members) {
				if (!vc_member.user.bot) {
					console.log(time);
					console.log(stop);
					meditators.push({
						usr: memberID,
						time: time,
						whenToStop: stop,
						guild: message.guild.id,
						channel: voiceChannel.id
					});

					try {
						await vc_member.roles.add(curr_role);
					} catch(err) {
						console.error("Role not found: " + err);
					}
				}
			}

			let people = meditators.length > 1 ? `${meditators.length} people` : 'you';
			let note = meditators.length > 1 ? `Anyone` : 'You';

			await message.channel.send(`:white_check_mark: I will notify ${people} when your ${time} minutes are up via a DM!\n**Note**: ${note} can end your time at any point by simply leaving the voice channel.`);

      Current.insertMany(meditators);
    } catch(err) {
      console.error('Meditation MongoDB error: ', err);
    }
  } else {
    return await message.channel.send(":x: You need to be in a voice channel to execute this command.");
  }
};

async function begin(client, voiceChannel, link=null) {
	voiceChannel.join().then(connection => {
		if(link) connection.play(ytdl(link, { quality: 'highestaudio' }));
	}).catch(err => console.error(err));
}

async function stop(client, meditation, difference, catchUp = false) {
	let description;
	var time = meditation.time;
	const guild = client.guilds.cache.get(meditation.guild);
	const voice = guild.channels.cache.get(meditation.channel);
	const user = guild.members.cache.get(meditation.usr);

	try {
		var role = await user.guild.roles.cache.find(role => role.id === config.roles.currently_meditating);

		await user.roles.remove(role);
	} catch(err) {
		console.error("Role not found: " + err);
	}
	
	try {
		if (voice.members.size === 0) {
			voice.leave();
		}
	} catch(err) {
		console.error(err);
	}

	if (catchUp) {
		description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you have finished your **${meditation.time}** minutes of meditation. I've added it to your total.`;
		time = time + difference;
	} else {
		description = `Hello! Your **${meditation.time}** minutes of meditation are done! I've added it to your total.`
	}

	await meditateUtils.addToDatabase(user.id, meditation.guild, time);

	const stopMessage = new Discord.MessageEmbed()
		.setColor(config.embed_color)
		.setTitle(`${config.emotes.meditation} Meditation Time Done ${config.emotes.meditation}`)
		.setDescription(description);

	user.send(stopMessage);

	try {
		await Current.deleteOne({
			usr: meditation.usr
		});

	} catch(err) {
		console.error('Meditation MongoDB error: ', err);
	}
}

async function scanForMeditations(client) {
	const currentDate = new Date();

	try {
		const meditations = await Current.find().toArray();

		if (meditations) {
			let difference;
			meditations.forEach(async meditation => {
				difference = currentDate - meditation.whenToStop;
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
module.exports.begin = begin;
module.exports.stop = stop;

module.exports.config = {
  name: 'meditate',
  aliases: [],
  module: 'Meditation',
  description: 'Keeps track of your meditation time for you. Join a voice channel and run the command, specifying how many minutes you would like to meditate for. It will join and play a gong sound to mark the beginning.\nYou may leave at any point to log the time so far.',
  usage: ['meditate <time in minutes>'],
};
