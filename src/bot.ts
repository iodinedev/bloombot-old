// Load dependencies
import fs from 'fs';
import Discord from 'discord.js';
import config from './config';

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

fs.readdir('./events/', (err, files) => {
  if (err) return console.error(err);
  const jsfile = files.filter((f) => f.split('.').pop() === 'js');
  if (jsfile.length <= 0) {
    return console.log('No errors have been loaded!');
  }
  jsfile.forEach((file) => {
    const event = require(`./events/${file}`);
    const eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  const jsfile = files
    .filter((t) => !t.includes('.test.'))
    .filter((f) => f.split('.').pop() === 'js');
  if (jsfile.length <= 0) {
    return console.log('No commands have been loaded!');
  }
  jsfile.forEach((f) => {
    const pull = require(`./commands/${f}`);
    client.commands.set(pull.architecture.name, pull);
    pull.architecture.aliases.forEach((alias) => {
      client.aliases.set(alias, pull.architecture.name);
    });
  });
});

client.login(config.botToken);
