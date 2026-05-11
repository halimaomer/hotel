import { resolve } from 'node:path';
import { styleText } from 'node:util';
import pino from 'pino';
import { type PrettyOptions } from 'pino-pretty';
import { config } from './app.mts';
import { env } from './env.mts';

/**
 * Das Modul enthält die Konfiguration für den Logger.
 * @packageDocumentation
 */

const logDirDefault = '/tmp';
const logFileNameDefault = 'server.log';
const logFileDefault = resolve(logDirDefault, logFileNameDefault);

const { log } = config;

if (log?.dir !== undefined && typeof log.dir !== 'string') {
    console.debug(`log.dir=${log.dir}`);
    throw new TypeError('Das konfigurierte Log-Verzeichnis ist kein String');
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const logDir: string | undefined =
    (log?.dir as string | undefined) === undefined
        ? undefined
        : log.dir.trimEnd(); // eslint-disable-line @typescript-eslint/no-unsafe-call
const logFile =
    logDir === undefined ? logFileDefault : resolve(logDir, logFileNameDefault);
const pretty = log?.pretty === true;

// https://getpino.io
// Log-Levels: fatal, error, warn, info, debug, trace
// Alternativen: Winston, log4js, Bunyan
// Pino wird auch von Fastify genutzt.
// https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
let logLevelTmp: LogLevel = 'info';
if (env.LOG_LEVEL !== undefined) {
    logLevelTmp = env.LOG_LEVEL as LogLevel;
} else if (log?.level !== undefined) {
    logLevelTmp = log?.level as LogLevel;
}
export const logLevel = logLevelTmp;

let message = styleText(['black', 'bgWhite'], 'logger config:');
console.log(
    `${message} logLevel=${logLevel}, logFile=${logFile}, pretty=${pretty}`,
);

const fileOptions = {
    level: logLevel,
    target: 'pino/file',
    options: { destination: logFile },
};
const prettyOptions: PrettyOptions = {
    translateTime: 'SYS:standard',
    singleLine: true,
    colorize: true,
    ignore: 'pid,hostname',
};
const prettyTransportOptions = {
    level: logLevel,
    target: 'pino-pretty',
    options: prettyOptions,
};

const options: pino.TransportMultiOptions | pino.TransportSingleOptions = pretty
    ? { targets: [fileOptions, prettyTransportOptions] }
    : { targets: [fileOptions] };
// in pino: type ThreadStream = any
// type-coverage:ignore-next-line
const transports = pino.transport(options); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

// https://github.com/pinojs/pino/issues/1160#issuecomment-944081187
export const parentLogger: pino.Logger<string> = pino(
    { level: logLevel },
    transports,
); // eslint-disable-line @typescript-eslint/no-unsafe-argument
