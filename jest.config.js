module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Настройка alias `~`
    '^~/(.*)$': '<rootDir>/src/$1',
  },
  // Включение расширений файлов для TypeScript и JavaScript
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};