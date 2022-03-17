import { PrismaClient } from '@prisma/client'

export const Meditations = (prisma: PrismaClient['meditations']) => {
  return Object.assign(prisma, {
    async getStreak(user: string): Promise<any> {
      const meditations = await prisma.findMany({where: {usr: user}});
      var days: number[] = [];

      for await (const meditation of meditations) {
        const difference = Date.now() - parseInt(meditation.date);
        const dayDifference = difference / 86400000;
        const rounded = Math.floor(dayDifference + 0.5);
        
        days.push(rounded);
      }

      var i = 0;
      for await (const day of days) {
        if (day !== i) return false;

        i++;
        return true;
      }

      return i;
    },
    async getSum(guild: string): Promise<number> {
      const meditations = await prisma.groupBy({
        by: ['guild'],
        where: {
          guild: guild
        },
        _sum: {
          time: true
        }
      });

      if (!meditations || !meditations[0] || !meditations[0]._sum || !meditations[0]._sum.time)
        return 0;

      return meditations[0]._sum.time;
    }
  });
}