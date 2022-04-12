import { PrismaClient } from '@prisma/client'

export const Meditations = (prisma: PrismaClient['meditations']) => {
  return Object.assign(prisma, {
    async getStreak(user: string, guildid: string): Promise<any> {
      const meditations = await prisma.findMany({
        where: {
          AND: [
            { usr: user },
            { guild: guildid }
          ]
        },
        orderBy: [
          { id: 'desc' }
        ]
      });
      var days: number[] = [];

      for await (const meditation of meditations) {
        console.log(meditation)
        const difference = Date.now() - parseInt(meditation.date);
        const dayDifference = difference / 86400000;
        console.log(dayDifference)
        const rounded = Math.floor(dayDifference + 0.5);
        console.log(rounded);
        console.log("------")
        
        if (days.lastIndexOf(rounded) === -1) days.push(rounded);
      }

      console.log(days)

      var i = 0;
      for await (const day of days) {
        if (day !== i) break;

        i++;
      }

      return i;
    },
    async getSum(guild: string, userid?: string): Promise<number> {
      var meditations;

      if (guild && userid) {
        meditations = await prisma.groupBy({
          by: ['guild'],
          where: {
            AND: [
              { guild: guild },
              { usr: userid }
            ]
          },
          _sum: {
            time: true
          }
        });
      } else {
        meditations = await prisma.groupBy({
          by: ['guild'],
          where: {
            guild: guild
          },
          _sum: {
            time: true
          }
        });
      }

      if (!meditations || !meditations[0] || !meditations[0]._sum || !meditations[0]._sum.time)
        return 0;

      return meditations[0]._sum.time;
    }
  });
}