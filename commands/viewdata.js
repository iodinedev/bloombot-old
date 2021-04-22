const Reminders = require('../databaseFiles/connect').Reminders;
const Tags = require('../databaseFiles/connect').Tags;
const Announcements = require('../databaseFiles/connect').Announcements;
const MeditationModel = require('../databaseFiles/connect').MeditationModel;
const GuildModel = require('../databaseFiles/connect').GuildModel;
const Current = require('../databaseFiles/connect').CurrentMeditators;
const Meditations = require('../databaseFiles/connect').Meditations;
const BotStats = require('../databaseFiles/connect').BotStats;

module.exports.execute = async (client, message) => {
  await Reminders.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await Tags.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await Announcements.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await MeditationModel.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await GuildModel.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await Current.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await Meditations.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
  await BotStats.find().toArray(function(err, result) {
    console.log(result);
  }).catch();
};

module.exports.config = {
  name: 'view',
  aliases: [],
  module: 'Meditation',
  description: 'Adds minutes to your meditation time.',
  usage: ['add <time in minutes>']
};
