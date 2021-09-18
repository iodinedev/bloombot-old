import { starboardActions } from '../eventActions/starboardActions';

export = async (client, message, channel) => {
  starboardActions.removeMessage(client, message);
};
