import { pino } from "pino";

const prodConfig = {
    level: "info",
    formatters: {
        level: (label: string) => ({ level: label.toUpperCase() })
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    messageKey: "message",
    nestedKey: "payload"
};

const devConfig = {
    level: "debug",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname",
            messageKey: "message"
        }
    }
};

const logger = pino(
    process.env.NODE_ENV === "production" ? prodConfig : devConfig
);

export default logger;
