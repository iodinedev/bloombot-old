const config = require('../config.json');

module.exports = async (client, oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    try {
      // Add roles and send welcome message to the welcome channel
      newMember.guild.channels.cache
        .get(config.channels.welcome)
        .send(
          `:tada: **A new member has arrived!** :tada:\nPlease welcome <@${after.id}> to the Meditation Mind Discord <@&828291690917265418>!\nWe're glad you've joined us. <:aww:578864572979478558>`
        )
        .then((message) => {
          message.react(config.emotes.wave);
        });
    } catch (err) {
      console.error(err);
    }
  }
};