import { User } from './User';
import { UserChallenge } from './UserChallenge';
import { UserChallengeProgress } from './UserChallengeProgress';
import { UserCredential } from './UserCredential';
import { UserDevice } from './UserDevice';

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

// User device model
User.hasMany(UserDevice, {
  foreignKey: 'userId',
  as: 'devices',
});

UserDevice.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// UserCredential model
User.hasMany(UserCredential, {
  foreignKey: 'userId',
  as: 'credentials',
});

UserCredential.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
