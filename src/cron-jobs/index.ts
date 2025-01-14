import cron from 'node-cron';

import { completeAllActiveChallengesInTheEndOfMonth } from '~/cron-jobs/jobs/challenge-completion';

cron.schedule(
  '0 0 28-31 * *',
  async () => {
    await completeAllActiveChallengesInTheEndOfMonth();
  },
  {
    runOnInit: true,
  },
);
