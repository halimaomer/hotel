/**
 * Das Modul enthält die Funktion, um die Test-DB neu zu laden.
 * @packageDocumentation
 */

import Bun from 'bun';
import figlet from 'figlet';
import { release, type, userInfo } from 'node:os';
import process from 'node:process';
import { serverConfig } from '../config/server.mts';
import { getLogger } from './logger.mts';

const logger = getLogger('banner', 'func');

/**
 * Ein Banner für den Server-Start.
 * @author [Halima Omer](mailto:omha1011@h-ka.de)
 */
export const banner = async () => {
    const { host, nodeEnv, port, portHttp } = serverConfig;

    console.log();
    const text = await figlet.text('buch 2026.4.1');
    console.log(text);

    const isContainer = /[0-9a-f]{12}/u.exec(host) ?? false;

    // https://nodejs.org/api/process.html
    logger.info('Bun: %s', Bun.version);
    logger.info('Bun / Node: %s', process.version);
    logger.info('NODE_ENV: %s', nodeEnv ?? 'undefined');
    logger.info('Rechnername: %s', host);
    logger.info('Port: %d', port);
    logger.info('HTTP-Port: %d', portHttp);
    logger.info('Betriebssystem: %s (%s)', type(), release());
    logger.info('Username: %s', userInfo().username);
    logger.info('Docker Container: %s', isContainer);
    if (isContainer) {
        logger.debug('!!! Container: Bruno nicht nutzbar mit Tokens !!!');
    }
};
