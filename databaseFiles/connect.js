// Database requirements - Connection created at end
const { MongoClient } = require('mongodb');
const config = require('../config.json');

// Create connection
const client = new MongoClient(
  config.mongodbURI,
  { useUnifiedTopology: true }
);

client.connect();

// Make sure MongoDB can be accessed outside of this file
module.exports.Reminders = client.db(config.mongodbDatabase).collection('Reminders');
module.exports.Tags = client.db(config.mongodbDatabase).collection('Tags');
module.exports.Announcements = client.db(config.mongodbDatabase).collection('Announcements');
module.exports.MeditationModel = client.db(config.mongodbDatabase).collection('MeditationModel');
module.exports.GuildModel = client.db(config.mongodbDatabase).collection('GuildModel');
module.exports.Meditations = client.db(config.mongodbDatabase).collection('Meditations');
module.exports.BotStats = client.db(config.mongodbDatabase).collection('BotStats');
