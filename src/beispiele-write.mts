import { PrismaPg } from '@prisma/adapter-pg';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient, type Prisma } from './generated/prisma/client.ts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
});

prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

const neuesHotel: Prisma.HotelCreateInput = {
    version: 0,
    name: 'Hotel Beispiel',
    erzeugt: '2026-05-06T00:00:00Z',
    aktualisiert: '2026-05-06T00:00:00Z',
    standort: {
        create: {
            strasse: 'Beispielstrasse',
            hausnummer: '1',
            plz: '76133',
            ort: 'Karlsruhe',
            land: 'Deutschland',
        },
    },
    zimmer: {
        create: [
            {
                preis: 99.99,
                zimmernummer: '101',
            },
            {
                preis: 149.99,
                zimmernummer: '102',
            },
        ],
    },
};

type HotelCreated = Prisma.HotelGetPayload<{
    include: {
        standort: true;
        zimmer: true;
    };
}>;

const geaendertesHotel: Prisma.HotelUpdateInput = {
    version: { increment: 1 },
    name: 'Hotel PUT',
    aktualisiert: new Date(),
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type HotelUpdated = Prisma.HotelGetPayload<{}>;

try {
    await prisma.$connect();

    await prisma.$transaction(async (tx) => {
        const hotelDb: HotelCreated = await tx.hotel.create({
            data: neuesHotel,
            include: {
                standort: true,
                zimmer: true,
            },
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${hotelDb.id}`);
        console.log();

        const hotelUpdated: HotelUpdated = await tx.hotel.update({
            data: geaendertesHotel,
            where: { id: 20 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${hotelUpdated.version}`);
        console.log();

        const geloescht = await tx.hotel.delete({
            where: { id: 70 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
