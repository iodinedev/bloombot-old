const oldMeditations = require('../meditations.json');
const meditateUtils = require('./utils/meditateUtils');

const total = oldMeditations.length;
var i = 0;

oldMeditations.forEach(async (entry) => {
  i = i + 1;

  var userid = entry.uid;
  var guildid = '244917432383176705';
  var time = entry.all_time + entry.last_time;

  console.log(userid);
  console.log(time);

  //await meditateUtils.addToDatabase(userid, guildid, time);

  console.log(`Added entry ${i} of total.`);
});