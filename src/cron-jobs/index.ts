import cron from 'node-cron';

import { completeAllActiveChallengesInTheEndOfMonth } from '~/cron-jobs/jobs/challenge-completion';

cron.schedule(
  '*/5 22-23 28-31 * *',
  async () => {
    await completeAllActiveChallengesInTheEndOfMonth();
  },
  {
    runOnInit: true,
  },
);
