import { prisma } from '../databaseFiles/connect';
import { Meditations } from '../databaseFiles/streaks';

export async function addToDatabase(userid, guildid, time) {
  var now = `${(new Date()).getTime()}`;

  await prisma.meditations.create({
    data: {
      usr: userid,
      date: now,
      time: time,
      guild: guildid,
    }
  });

  return true;
}

export async function getUserData(userid, guildid) {
  const meditations = Meditations(prisma.meditations);

  const meditation_count = await meditations.count({
    where: {
      AND: [{ usr: userid }, { guild: guildid }],
    },
  });
  const meditation_time: number = await meditations.getSum(guildid, userid);
  const streak = await meditations.getStreak(userid, guildid);

  const latest = await meditations.findMany({
    where: {
      AND: [{ usr: userid }, { guild: guildid }],
    },
    orderBy: [
      {
        date: 'desc'
      }
    ],
    take: 2
  });

  return {
    meditation_count,
    meditation_time,
    streak,
    latest,
  };
}

export async function getGuildData(guildid) {
  const meditations = Meditations(prisma.meditations);
  var meditation_count = await meditations.count({
    where: {
      guild: guildid,
    }
  });

  const meditation_time = await meditations.getSum(guildid);

  return {
    meditation_count,
    meditation_time,
  };
}
