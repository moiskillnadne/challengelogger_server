import winston from 'winston';
import CloudWatch from 'winston-cloudwatch';

const messageFormatter = (info: winston.LogEntry): string => {
  return `${info.level}: ${info.message}`;
};

const cloudWatchTransport = new CloudWatch({
  logGroupName: process.env.CLOUD_WATCH_LOG_GROUP,
  logStreamName: process.env.CLOUD_WATCH_LOG_STREAM,
  jsonMessage: false,
  awsOptions: {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_KEY ?? '',
    },
  },
  messageFormatter,
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(messageFormatter),
  transports: [new winston.transports.Console({}), cloudWatchTransport],
});
