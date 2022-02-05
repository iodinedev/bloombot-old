// Database requirements - Connection created at end
import { MongoClient } from 'mongodb';
import config from '../config';

// Create connection
const client = new MongoClient(config.mongodbURI);

client.connect();

// Make sure MongoDB can be accessed outside of this file
export const Prefixes = client
  .db(config.mongodbDatabase)
  .collection('Prefixes');
export const Tags = client.db(config.mongodbDatabase).collection('Tags');
export const Announcements = client
  .db(config.mongodbDatabase)
  .collection('Announcements');
export const Current = client
  .db(config.mongodbDatabase)
  .collection('CurrentMeditators');
export const Meditations = client
  .db(config.mongodbDatabase)
  .collection('Meditations');
export const BotStats = client
  .db(config.mongodbDatabase)
  .collection('BotStats');
export const ServerSetup = client
  .db(config.mongodbDatabase)
  .collection('ServerSetup');
export const Stars = client.db(config.mongodbDatabase).collection('Starboard');
export const PickMessages = client
  .db(config.mongodbDatabase)
  .collection('PickMessages');
export const Keys = client.db(config.mongodbDatabase).collection('Keys');
