const reactions = require('../config.json').channelReacts;

export class reactionCheckAction {
  static async checkIfCorrect(message) {
    for (var i = 0; i < reactions.length; i++) {
      var obj = reactions[i];
      try {
        if (message.channel.id === obj.channel) {
          obj.reacts.forEach(async (react) => {
            await message.react(react);
          });
        }
      } catch (err) {
        console.log('Error with reaction.' + err);
      }
    }
  }
}
