import cron from 'node-cron';

import { completeAllActiveChallengesInTheEndOfMonth } from '~/cron-jobs/jobs/challenge-completion';

cron.schedule(
  '*/5 22-23 28-31 * *',
  async () => {
    await completeAllActiveChallengesInTheEndOfMonth();
    // There is a limit of 120000 status updates with current implementation
  },
  {
    runOnInit: true,
  },
);
