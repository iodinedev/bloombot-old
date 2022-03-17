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

  var meditation_count = await meditations.count({
    where: {
      AND: [{ usr: userid }, { guild: guildid }],
    }
  });

  const meditation_time: number = await meditations.getSum(guildid, userid);

  var streak = await getStreak(userid);

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

export async function getStreak(userid) {
  const meditations = Meditations(prisma.meditations);
  var streaks = await meditations.getStreak(userid);

  var streak = 0;

  if (streaks && streaks[0]) {
    streaks[0]['days'].every(async (day) => {
      if (day !== streak) return false;

      streak++;
      return true;
    });
  }

  return streak;
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
