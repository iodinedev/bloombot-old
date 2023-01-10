import { prisma } from '../databaseFiles/connect';

export const isStaff = async (message, user_id) => {
  var staff = await prisma.serverSetup.findUnique({
    where: {
      guild: message.guild.id,
    },
  });

  if (!staff || !staff.admins) return false;

  if (staff.admins.indexOf(user_id) === -1) return false;

  return true;
}