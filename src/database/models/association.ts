import { User } from './User';
import { UserChallenge } from './UserChallenge';
import { UserChallengeProgress } from './UserChallengeProgress';
import { UserCredential } from './UserCredential';
import { UserDevice } from './UserDevice';
import { UserMeta } from './UserMeta';

import { UserNotificationSettings } from '~/database/models/UserNotificationSettings';

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
  as: 'progress',
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

// UserMeta model
User.hasOne(UserMeta, {
  foreignKey: 'userId',
  as: 'meta',
});

UserMeta.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// UserNotificationSettings model

User.hasOne(UserNotificationSettings, {
  foreignKey: 'userId',
  as: 'notificationSettings',
});

UserNotificationSettings.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});
