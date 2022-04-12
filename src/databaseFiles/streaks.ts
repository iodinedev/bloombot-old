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

      var i = 0;
      var last = 0;

      for await (const meditation of meditations) {
        const difference = Date.now() - parseInt(meditation.date);
        const dayDifference = difference / 86400000;
        const rounded = Math.floor(dayDifference + 0.5);
        console.log(rounded);
        
        if (last + 2 >= rounded && rounded !== last) {
          i++;
          last = rounded;
        } else {
          break;
        }
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