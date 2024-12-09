const storagePath = process.env.SQLITE_DB_PATH;

console.log(`[db.config.js] Storage path: ${storagePath}`);

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: storagePath,
  },
};
