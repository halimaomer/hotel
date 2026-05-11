import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient } from '../generated/prisma/client.ts';
import { getLogger } from '../logger/logger.mts';

/**
 * Das Modul besteht aus dem Objekt {@linkcode prismaClient} als DB-Client
 * mit _Prisma_.
 * @packageDocumentation
 */

const logger = getLogger('prisma-client', 'file');

// PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env"
// d.h. mit PostgreSQL-User "buch" und Schema "buch"
export const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

let tmpClient: PrismaClient;

if (logger.isLevelEnabled('debug')) {
    const debugClient = new PrismaClient({
        adapter,
        errorFormat: 'pretty',
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            'info',
            'warn',
            'error',
        ],
        // Kommentar zu Log-Ausgabe generieren:
        // /*prismaQuery='Buch.findMany%3A... mit base64-Codierung
        // https://www.prisma.io/docs/orm/reference/prisma-client-reference#comments
        comments: [prismaQueryInsights()],
    });

    debugClient.$on('query', (e) => {
        // console.log(), weil der Pino-Logger asynchron ist
        const message = styleText(['black', 'bgWhite'], 'Query:');
        console.log(`${message} ${e.query}`);
    });

    tmpClient = debugClient;
} else {
    const prodClient = new PrismaClient({ adapter });
    tmpClient = prodClient;
}

/**
 * PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env".
 * @author [Halima Omer](mailto:omha1011@h-ka.de)
 */
export const prismaClient = tmpClient;

/**
 * Prisma-Client mit der DB verbinden.
 * @author [Halima Omer](mailto:omha1011@h-ka.de)
 */
export const connectDB = async () => {
    await prismaClient.$connect();
    logger.info('Verbindung mit der DB ist hergestellt.');
};

/**
 * DB-Verbindung für den Prisma-Client trennen.
 * @author [Halima Omer](mailto:omha1011@h-ka.de)
 */
export const disconnectDB = async () => {
    await prismaClient.$disconnect();
    logger.info('Verbindung mit der DB ist getrennt.');
};
