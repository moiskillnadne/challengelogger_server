import { UserChallengeCrud } from '~/api/userChallenge/challenge.crud';

export const completeAllActiveChallengesInTheEndOfMonth = async () => {
  const today = new Date();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  console.info(
    `[Cron - Complete All Active Challenges] Today: ${today.getDate()} | Last day of month: ${lastDayOfMonth}`,
  );

  if (today.getDate() === lastDayOfMonth) {
    try {
      await UserChallengeCrud.completeAllActiveChallenges();
      console.info(
        `[Cron - Complete All Active Challenges] Active Challenge Completion executed`,
      );
    } catch (error) {
      console.error(`[Cron - Complete All Active Challenges] ${error}`);
    }
  }
};
