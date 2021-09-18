import Discord from 'discord.js';
import config from '../config';
import { Stars } from '../databaseFiles/connect.js';

export class starboardActions {
  static async addStar(client, user, reaction) {
    if (
      reaction._emoji &&
      reaction._emoji.name === config.emotes.star &&
      reaction.message.channel.id != config.channels.starchannel
    ) {
      var stars = reaction.count;
      var username = reaction.message.author.username;
      var message = reaction.message.content;
      var avatar = reaction.message.author.displayAvatarURL();
      var link = `https://discordapp.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;

      var att = reaction.message.attachments;

      let result = await Stars.findOne({ messageID: reaction.message.id });

      if (result === null) {
        if (reaction.count >= config.min_stars) {
          let starBoardMessage = new Discord.MessageEmbed();
          starBoardMessage.color = config.colors.embedColor;
          starBoardMessage.author = { name: username, url: avatar };
          starBoardMessage.description =
            message + '\n\n**[Click to jump to message.](' + link + ')**';
          starBoardMessage.footer = { text: '⭐ Times starred: ' + stars };

          if (att.array()[0]) {
            att = att.array()[0].url;
            starBoardMessage.setImage(att);
          }

          let channel = await client.channels.cache.get(
            config.channels.starchannel
          );

          channel.send({embeds: [ starBoardMessage ]}).then((sentmessage) => {
            let starObject = {
              messageID: reaction.message.id,
              embedID: sentmessage.id,
              messageChannelID: reaction.message.channel.id,
            };

            Stars.insertOne(starObject).then(() => {
              return;
            });
          });
        }
      } else {
        client.channels.cache
          .get(config.channels.starchannel)
          .messages.fetch(result.embedID)
          .then((starmessage) => {
            var starmessageEmbed = starmessage.embeds[0];
            var times = starmessageEmbed.footer.text.substring(
              16,
              starmessageEmbed.footer.text.length
            );
            times = reaction.count;
            starmessageEmbed.setFooter('⭐ Times starred: ' + times.toString());
            return starmessage.edit(starmessageEmbed);
          });
      }
    }
  }

  static async removeStar(client, user, reaction) {
    if (reaction._emoji && reaction._emoji.name === config.emotes.star) {
      let result = await Stars.findOne({ messageID: reaction.message.id });

      if (result !== null) {
        client.channels.cache
          .get(config.channels.starchannel)
          .messages.fetch(result.embedID)
          .then((starmessage) => {
            if (reaction.count > 0) {
              var starmessageEmbed = starmessage.embeds[0];
              var times = starmessageEmbed.footer.text.substring(
                16,
                starmessageEmbed.footer.text.length
              );
              times = reaction.count;
              starmessageEmbed.setFooter(
                '⭐ Times starred: ' + times.toString()
              );
              return starmessage.edit(starmessageEmbed);
            } else {
              Stars.deleteOne({ messageID: reaction.message.id }).then(() => {
                return starmessage.delete();
              });
            }
          });
      }
    }
  }

  static async removeMessage(client, message) {
    let result = await Stars.findOne({ messageID: message.id });

    if (result !== null) {
      client.channels.cache
        .get(config.channels.starchannel)
        .messages.fetch(result.embedID)
        .then((starmessage) => {
          Stars.deleteOne({ messageID: message.id }).then((_) => {
            return starmessage.delete();
          });
        });
    }

    result = await Stars.findOne({ embedID: message.id });

    if (result !== null) {
      Stars.deleteOne({ embedID: message.id }).then(
        client.channels.cache
          .get(result.messageChannelID)
          .messages.fetch(result.messageID)
          .then((starmessage) => {
            starmessage.reactions.removeAll();
          })
      );
    }
  }
}
