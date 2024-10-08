import { User } from './User';
import { UserChallenge } from './UserChallenge';
import { UserChallengeProgress } from './UserChallengeProgress';

// User model
User.hasMany(UserChallenge, {
  foreignKey: 'userId',
  as: 'challenges',
});
UserChallenge.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// UserChallenge model
UserChallenge.hasMany(UserChallengeProgress, {
  foreignKey: 'userChallengeId',
  as: 'progresses',
});
UserChallengeProgress.belongsTo(UserChallenge, {
  foreignKey: 'userChallengeId',
  as: 'userChallenge',
});
