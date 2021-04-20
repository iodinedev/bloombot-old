const config = require('../config.json');
const Discord = require('discord.js');

const config = require('../config.json');
const prefix = config.prefix;

const errors = require('../helpers/remindErrors.js');
const remindUtils = require('../utils/remindUtils.js');

const Reminder = require('../databaseFiles/connect.js').Reminders;

const monthsData = require('../data/monthsData.js');


module.exports.execute = async (client, message, args) => {
  if (indexOf(global_admins, message.author.id) !== -1) {
    if (args.length === 0 || args.length === 1 && (args[0] === 'help' || args[0] === 'info')) {
      const remindHelp = new Discord.MessageEmbed()
        .setColor('#FFEC09')
        .setTitle(`${config.emotes.reminders} Meditation Mind Remind Help ${config.emotes.reminders}`)
        .setDescription('Here are some commands to help you out with reminders!')
        .addField('Add a reminder',
          `\`${prefix}remind [me to] <task> in <how many> minutes/hours/days/months\`
          Example: \`${prefix}remind me to do laundry in 2 hours\`
          
          =================================================
          
          \`${prefix}remind [me to] <task> on <date>\`
          Example: \`${prefix}remind me to do laundry on July 21st\`
          
          =================================================
          
          \`${prefix}remind [me to] <task> every <how many> minute[s]/hour[s]/day[s]/month[s]\`
          Example: \`${prefix}remind me to do laundry every day\`
          
          =================================================
          
          *Note: the parts in the square brackets are optional.*`)
        .addField('List your reminders', '`!remind list`')
        .addField('Remove a reminder',
          `\`${prefix}remind (remove/delete) <reminder ID to remove>/(all)\`
        You can find out the ID of the reminder by using \`${prefix}remind list\``);
      await message.author.send(remindHelp)
      return await message.channel.send(':white_check_mark: I have sent you a DM about the `remind` command.');
    } else if (args.length === 1 && args[0] === 'list') {

      let remindersStringForEmbed = '';

      await Reminder.find({
        whoToRemind: message.author.id
      }).toArray(function(err, result) {
        if (err) throw err;

        result.forEach(reminder => {
          let id = reminder._id;
          let whatToRemind = reminder.whatToRemind;
          let whenToRemind = reminder.whenToRemind;
          let recurring = reminder.recurring;
          let howOftenToRemind = reminder.howOftenToRemind;
    
          whenToRemind = remindUtils.parseDateForListing(whenToRemind);

          if (recurring) {
            let parsedHowOftenToRemind = remindUtils.parseSingularOrPlural(howOftenToRemind);
    
            const reminderToConcat = `${id}: **${whatToRemind}** every ${parsedHowOftenToRemind} (next occurence at ${whenToRemind})\n`;
            remindersStringForEmbed = remindersStringForEmbed.concat(reminderToConcat);
          } else {
            const reminderToConcat = `${id}: **${whatToRemind}** at ${whenToRemind}\n`;
            remindersStringForEmbed = remindersStringForEmbed.concat(reminderToConcat);
          }
        });

        if (remindersStringForEmbed) {
          const remindList = new Discord.MessageEmbed()
            .setColor('#FFEC09')
            .setTitle(`${config.emotes.reminders} Your Reminders ${config.emotes.reminders}`)
            .setDescription('Each entry is in the form of <id>: <reminder>.')
            .addField('Reminders', remindersStringForEmbed);
    
          message.author.send(remindList);
          return message.channel.send(':white_check_mark: I have sent you a DM with your reminders.');
        } else {
          return message.reply('you don\'t have any saved reminders!');
        }
      });
    } else if (args.length === 2 && (args[0] === 'remove' || args[0] === 'delete')) {
      if (args[1] === 'all') {
        try {
          var destroyed = await Reminder.deleteOne({
            whoToRemind: message.author.id
          });
        }	catch(err) {
          console.error('Reminder Sequelize error: ', err);
        }
      } else if (Number.isInteger(parseInt(args[1]))) {
        try {
          destroyed = await Reminder.deleteOne({
            id: parseInt(args[1]),
            whoToRemind: message.author.id
          });
        } catch(err) {
          console.error('Reminder Sequelize error: ', err);
        }
      } else {
        return await message.reply('your command usage is invalid! See `!remind help` for guidance.');
      }

      if (!destroyed) return await message.reply('there isn\'t a reminder with such ID assigned to you! Check `!remind list` for a list of your reminders.');
      else if (destroyed === 1) return await message.reply('the reminder has been removed successfully!');
      else return await message.reply('all your reminders have been removed successfully!');
    } else {
      const currentDate = new Date();
      const whoToRemind = message.author.id;
      let whatToRemind, whenToRemind, recurring, howOftenToRemind;


      var wait_time = config.wait_time;
        await ctx.send(":white_check_mark: Announcing the first message in 48h from now.");

        await asyncio.sleep(wait_time);
        await remind_channel.send(
          embed=Embed(color=Color.green(), description=message).set_thumbnail(url=link_to_image)
        );

        msg = await remind_channel.send(role_to_mention.mention);
        await asyncio.sleep(wait_time);
        await remind_channel.send(
          embed=Embed(color=Color.green(), description=message).set_thumbnail(url=link_to_image)
        );

        msg = await remind_channel.send(role_to_mention.mention);

      try {
        [whatToRemind, whenToRemind, recurring, howOftenToRemind] = parseReminder(args, currentDate, message);
      } catch (err) {
        console.error(err);

        if (err instanceof errors.MonthLengthValidationError) {
          return await message.channel.send(
            `Whoops! ${err.month} doesn't have ${err.days} days! Please correct the command or see \`!remind help\` for guidance!`
          );
        } else if (err instanceof errors.NonmatchingInputValidationError) {
          return await message.channel.send(
            'I\'m sorry, but the command you\'ve used is invalid. Please use `!remind help` for guidance on how to structure it correctly!'
          );
        }
      }

      try {
        return Reminder.insertOne({
          whoToRemind: whoToRemind,
          whatToRemind: whatToRemind,
          whenToRemind: whenToRemind,
          recurring: recurring,
          howOftenToRemind: howOftenToRemind
        });
      } catch(err) {
        console.error('Reminder MongoDB error: ', err);
      }
    }
  } else {
    return await message.channel.send(":x: Error: You dont have this permission.")
  }
};


function parseReminder(unparsedArgs, currentDate, message) {
	// This might be significant later on when constructing Horace's reminding message.
	const regMy = new RegExp('my', 'i');

	// This RegExp matches reminders in the form of "!remind [me to] <task> in <how many> minutes/hours/days/months".
	// The first group is the action to be reminded about, the second group is how many
	// minutes/hoursdays/months (determined by the third group) should pass before the reminder.
	const regOne = new RegExp('(?:me to)? *(.*) +in +((?:\\d+)|(?:a)|(?:an)) +(minutes?|hours?|days?|months?)', 'i');

	// This RegExp matches reminders in the form of "!remind [me to] <task> on <date>".
	// The first group is the action to be reminded about, the second group is the month,
	// and the third group is the day.
	const regTwo = new RegExp('(?:me to)? *(.*) +on +((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) +(\\d+) *(?:st|nd|rd|th)?', 'i');

	// This RegExp matches reminders in the form of "!remind [me to] <task> every <how many> minutes/hours/days/months".
	// The first group is the action to be remided about, and the second and third group dictate how often
	// to remind.
	const regThree = new RegExp('(?:me to)? *(.*) +every +(\\d+ )?(minutes?|hours?|days?|months?)', 'i');

	let toPush = '';
	let correctedInput = [];

	unparsedArgs.forEach(word => {
		// HACK SpellChecker corrects some of the month names' abbreviations (e.g. "feb" -> "fib").
		// This works around that by checking if the word to be added is in fact such abbreviation,
		// and if so, the loop continues with the next iteration.
		if (Object.keys(monthsData).includes(word)) { correctedInput.push(word); return; }

		// Ternary operation that corrects the word if there's a typo, but leaves it as is if there's not.
		toPush = word;

		// This might be significant later on when constructing Horace's reminding message.
		toPush = toPush.replace(regMy, 'your');

		correctedInput.push(toPush);
	});

	// We need a string to work with regexes.
	let stringInput = correctedInput.join(' ');

	let matchRegOne = stringInput.match(regOne);
	let matchRegTwo = stringInput.match(regTwo);
	let matchRegThree = stringInput.match(regThree);

	let whatToRemind, whenToRemind, recurring, howOftenToRemind;

	if (matchRegOne) {
		whatToRemind = matchRegOne[1];

		let amountToAdd = ['a', 'an'].includes(matchRegOne[2].toLowerCase()) ? 1 : parseInt(matchRegOne[2]);
		let whatToAdd = matchRegOne[3];

		whenToRemind = remindUtils.addToDate(currentDate, amountToAdd, whatToAdd);

		recurring = false;
		howOftenToRemind = null;

		// We need to build the confirmation message differently than in the database.
		let whenToRemindForConfirmation = 'in ' + amountToAdd + ' ' + whatToAdd;

		confirmReminder(whatToRemind, whenToRemindForConfirmation, message);
	} else if (matchRegTwo) {
		whatToRemind = matchRegTwo[1];

		let monthAbbreviation = matchRegTwo[2].slice(0, 3).toLowerCase();
		let month = monthsData[monthAbbreviation]['number'];
		let day = matchRegTwo[3];

		if (day > monthsData[monthAbbreviation]['length']) {
			let errorMessage = `${monthsData[monthAbbreviation]['fullname']} doesn't have ${day} days.`;
			throw new errors.MonthLengthValidationError(errorMessage, monthsData[monthAbbreviation]['fullname'], day);
		}

		whenToRemind = new Date(currentDate.getFullYear(), month, day, currentDate.getHours(), currentDate.getMinutes());

		if (whenToRemind - currentDate < 0) {
			whenToRemind = remindUtils.addToDate(whenToRemind, 1, 'year');
		}

		recurring = false;
		howOftenToRemind = null;

		// We need to build the confirmation message differently than in the database.
		let whenToRemindForConfirmation = 'on ' + monthsData[monthAbbreviation]['fullname'] + ' ' + day;
		confirmReminder(whatToRemind, whenToRemindForConfirmation, message);
	} else if (matchRegThree) {
		whatToRemind = matchRegThree[1];

		let amountToAdd = matchRegThree[2] ? parseInt(matchRegThree[2]) : 1;
		let whatToAdd = matchRegThree[3];
		whenToRemind = remindUtils.addToDate(currentDate, amountToAdd, whatToAdd);

		recurring = true;
		howOftenToRemind = [amountToAdd, whatToAdd].join(' ');

		let parsedHowOftenToRemind = remindUtils.parseSingularOrPlural(howOftenToRemind);

		// We need to build the confirmation message differently than in the database.
		let whenToRemindForConfirmation = 'every ' + parsedHowOftenToRemind;

		confirmReminder(whatToRemind, whenToRemindForConfirmation, message);
	} else {
		throw new errors.NonmatchingInputValidationError('The command format doesn\'t match any of the regexes.');
	}


	return [whatToRemind, whenToRemind, recurring, howOftenToRemind];
}

async function confirmReminder(whatToRemind, whenToRemind, message) {
	let confirmation_message = await message.channel.send(`
Hey ${message.author.username}! I'm not perfect, so please confirm if that is correct.
Do you want me to remind you to ${whatToRemind} ${whenToRemind}? React with thumbs up or thumbs down!
**Please note that this message will disappear in 20 seconds.**`
	);

	let confirm, deny;
	[confirm, deny] = [config.emotes.confirm, config.emotes.deny];

	confirmation_message.react(confirm).then(() => confirmation_message.react(deny));

	const filter = (reaction, user) => {
		return [confirm, deny].includes(reaction.emoji.name) && user.id === message.author.id;
	};

	confirmation_message.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
		.then(collected => {
			const reaction = collected.first();

			confirmation_message.delete();

			if (reaction.emoji.name === confirm) {
				message.reply('I added your reminder to the database!');
			} else if (reaction.emoji.name === deny) {
				let errorMessage = 'User decided that the parsed reminder is invalid.';
				let toSend = 'yikes! Please consider trying again or use `${prefix}remind help` for guidance!';

				throw new errors.ReminderDeniedValidationError(errorMessage, toSend);
			}
		})
		.catch(err => {
			confirmation_message.delete();

			if (err instanceof errors.ReminderDeniedValidationError) {
				console.error(err);
				return message.reply(err.toSend);
			} else {
				return message.reply('you didn\'t confirm nor deny. Please try again or use `${prefix}remind help` for guidance!');
			}
		});
}

async function remind(client, date, reminder, catchUp = false) {
	let userToRemind = await client.users.fetch(reminder.whoToRemind);
	let color, description;

	if (catchUp) {
		color = '#FF4500';
		description = `Whoops! Sorry for being late, I was probably down for maintenance. 😅
		Anyway, you asked me to remind you to **${reminder.whatToRemind}**. I hope it's not too late. 🤐`;
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

async function scanForReminders(client) {
	const currentDate = new Date();

	try {
		const reminders = await Reminder.find();

		if (reminders) {
			let difference;
			reminders.forEach(async reminder => {
				difference = currentDate - reminder.whenToRemind;
				if (difference > (-1)*config.reminderScanInterval) {
					remind(client, currentDate, reminder);
				}
			});
		}
	} catch(err) {
		console.error('Reminder MongoDB error: ', err);
	}
}

async function catchUp(client) {
	const currentDate = new Date();
	
	try {
		const reminders = await Reminder.find();
		
		if (reminders) {
			let difference;
			reminders.forEach(async reminder => {
				difference = currentDate - reminder.whenToRemind;
				if (difference > 0) {
					remind(client, currentDate, reminder, true);
				}
			});
		}
	} catch(err) {
		console.error('Reminder MongoDB error: ', err);
	}
}

module.exports.scanForReminders = scanForReminders;
module.exports.catchUp = catchUp;

module.exports.config = {
	name: 'remind',
	aliases: ['remind'],
	module: 'Utility',
	description: 'Set up a reminder!',
	usage: [`\`${prefix}remind [me to] <task> in <how many> minutes/hours/days/months\``, `\`${prefix}remind [me to] <task> on <date>\``, `\`${prefix}remind [me to] <task> every <how many> minute[s]/hour[s]/day[s]/month[s]\``]
};