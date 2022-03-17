import * as mongo from './databaseFiles/transitionConnect';
import { prisma } from './databaseFiles/connect';

async function transition() {
  const data2: any = await mongo.Tags.find().toArray();
  await prisma.tags.createMany({data: data2});
  const data5: any = await mongo.Meditations.find().toArray();
  await prisma.meditations.createMany({data: data5});
  const data7: any = await mongo.ServerSetup.find().toArray();
  await prisma.tags.createMany({data: data7});
  const data8: any = await mongo.Stars.find().toArray();
  await prisma.tags.createMany({data: data8});
  const data9: any = await mongo.PickMessages.find().toArray();
  await prisma.tags.createMany({data: data9});
  const data0: any = await mongo.Keys.find().toArray();
  await prisma.tags.createMany({data: data0});
}

transition()