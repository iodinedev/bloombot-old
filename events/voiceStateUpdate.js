const meditate_functions = require('../commands/meditate.js');
const Current = require('../databaseFiles/connect').Current;
const config = require('../config.json');

module.exports = async (client, oldState, newState) => {
  const currentDate = new Date();
  const guild = oldState.guild;
  const member = guild.members.cache.get(oldState.id);

	if (oldState.channelID && !newState.channelID) {
    const voiceChannel = guild.channels.cache.get(oldState.channelID);

    var humans = 0;

    voiceChannel.members.forEach(member => {
      if (!member.user.bot) humans += 1;
    });

    if (humans === 0) {
      try {
        await voiceChannel.leave();
      } catch(err) {
        console.error(err);
      }
    }

    try {
      const meditation = await Current.findOne({
        usr: member.id
      });

      if (meditation) {
        let difference;
        if (meditation.whenToStop === null) {
          difference = meditation.whenToStop - currentDate;
        } else {
          difference = currentDate - meditation.started;
        }

        difference = new Date(difference).getMinutes();     

        await Current.updateOne(
          { usr: member.id },
          { $set: {
              time: meditation.time - difference
            }
          }
        );

        const new_meditation = await Current.findOne({
          usr: member.id
        });

        meditate_functions.stop(client, new_meditation, difference);

        client.user.setActivity(config.playing);
      }
    } catch(err) {
      console.error('Meditation MongoDB error: ', err);
    }
	}

	if (!oldState.channelID && newState.channelID) {
    const voiceChannel = guild.channels.cache.get(newState.channelID);

    if (await Current.countDocuments() > 0) {
      var latest = await Current.find().sort({_id:-1}).limit(1).toArray();

      latest = latest[0];

      let difference;
      difference = latest.whenToStop - currentDate;

      var time = new Date(difference).getMinutes();
      if (time === 0) time = 1;

      var curr = new Date();
      var stop = new Date(curr.getTime() + time * 60000).getTime();

      try {			
        meditate_functions.begin(client, voiceChannel);
  
        try {
          var curr_role = await guild.roles.cache.find(role => role.id === config.roles.currently_meditating);
  
          await member.roles.add(curr_role);
        } catch(err) {
          console.error("Role not found: " + err);
        }

        const meditation_channel = guild.channels.cache.find(channel => channel.id === config.channels.group_meditation);
  
        await meditation_channel.send(`:white_check_mark: You have joined the group meditation session with ${time} minutes remaining <@${member.id}>!\n**Note**: You can end your time at any point by simply leaving the voice channel.`);

        Current.insertOne({
          usr: member.id,
          time: time,
          whenToStop: stop,
          guild: guild.id,
          channel: voiceChannel.id
        });
    
        var humans = 0;
    
        voiceChannel.members.forEach(member => {
          if (!member.user.bot) humans += 1;
        });

        client.user.setActivity(`${humans} people currently meditating!`);
      } catch(err) {
        console.error('Meditation MongoDB error: ', err);
      }
    }
  }
}
