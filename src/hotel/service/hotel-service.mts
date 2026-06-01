/**
 * Das Modul besteht aus der Klasse {@linkcode HotelService}.
 * @packageDocumentation
 */

import {type Prisma } from '../../generated/prisma/client.ts';
import { type Suchparameter, suchparameterNamen } from './suchparameter.mts';
import { type HotelInclude } from '../../generated/prisma/models/Hotel.ts';
import { NotFoundError } from './errors.mts';
import { type Pageable } from './pageable.mts';
import { type Slice } from './slice.mts';
import { buildWhere } from './where-builder.mts';
import { getLogger } from '../../logger/logger.mts';
import { prismaClient } from '../../config/prisma-client.mts';

type FindByIdParams = {
    readonly id: number;
    readonly mitZimmern?: boolean;
};

export type HotelMitStandort = Prisma.HotelGetPayload<{
    include: { standort: true };
}>;

export type HotelMitStandortDTO = Omit<HotelMitStandort, 'preis'> & {
    preis: number;
};

export type HotelMitStandortundZimmern = Prisma.HotelGetPayload<{
    include: {
        standort: true;
        zimmer: true;
    };
}>;

export type HotelMitStandortundZimmernDTO = Omit<
    HotelMitStandortundZimmern,
    'preis'
> & {
    preis: number;
};

/**
 * Die Klasse `HotelService` implementiert das Lesen für Hotels und greift
 * mit _Prisma_ auf eine relationale DB zu.
 */
export class HotelService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #includeStandort: HotelInclude = { standort: true };
    readonly #includeStandortUndZimmer: HotelInclude = {
        standort: true,
        zimmer: true,
    };

    readonly #logger = getLogger(HotelService.name);

    /**
     * Ein Hotel asynchron anhand seiner ID suchen
     * @param id ID des gesuchten Hotels
     * @returns Das gefundene Hotel in einem Promise aus ES2015.
     * @throws NotFoundError falls kein Hotel mit der ID existiert
     */
    async findById({
        id,
        mitZimmern,
    }: FindByIdParams): Promise<Readonly<HotelMitStandortundZimmernDTO>> {
        this.#logger.debug('findById: id=%d', id);

        const include = mitZimmern
            ? this.#includeStandortUndZimmer
            : this.#includeStandort;
        const hotel: HotelMitStandortundZimmern | null =
            await prismaClient.hotel.findUnique({
                where: { id },
                include,
            });
        if (hotel === null) {
            this.#logger.debug('Es gibt kein Hotel mit der ID %d', id);
            throw new NotFoundError(`Es gibt kein Hotel mit der ID ${id}.`);
        }

        // Rest Properties
        const { preis, ...hotelRest } = hotel;
        const hotelDTO: HotelMitStandortundZimmernDTO = {
            // Spread Properties
            ...hotelRest,
            preis: preis.toNumber(),
        };

        this.#logger.debug('findById: hotelDTO=%o', hotelDTO);
        return hotelDTO;
    }

    /**
     * Hotels asynchron suchen.
     * @param suchparameter JSON-Objekt mit Suchparameter.
     * @param pageable Maximale Anzahl an Datensätzen und Seitennummer.
     * @returns Ein JSON-Array mit den gefundenen Hotels.
     * @throws NotFoundError falls keine Hotels gefunden wurden.
     */
    async find(
        suchparameter: Suchparameter | null,
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<HotelMitStandortDTO>>>> {
        this.#logger.debug(
            'find: suchparameter=%s, pageable=%o',
            JSON.stringify(suchparameter),
            pageable,
        );

        // Keine Suchparameter?
        if (suchparameter === null) {
            return await this.#findAll(pageable);
        }
        const keys = Object.keys(suchparameter);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        // Falsche Namen fuer Suchparameter?
        if (!this.#checkKeys(keys)) {
            this.#logger.debug('Ungueltige Suchparameter');
            throw new NotFoundError('Ungueltige Suchparameter');
        }

        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const where = buildWhere(suchparameter);
        const { number, size } = pageable;
        const hotels: HotelMitStandort[] = await prismaClient.hotel.findMany({
            where,
            skip: number * size,
            take: size,
            include: this.#includeStandort,
        });
        if (hotels.length === 0) {
            this.#logger.debug('find: Keine Hotels gefunden');
            throw new NotFoundError(
                `Keine Hotels gefunden: ${JSON.stringify(suchparameter)}, Seite ${pageable.number}}`,
            );
        }
        const totalElements = await this.count(where);
        return this.#createSlice(hotels, totalElements);
    }

    /**
     * Anzahl der gefundenen Hotels zurückliefern.
     * @param WHERE-Klausel der eigentlichen Suche.
     * @returns Anzahl der gefundenen Hotels.
     */
    async count(where?: Prisma.HotelWhereInput) {
        this.#logger.debug('count: where=%o', where ?? 'undefined');
        const { count } = prismaClient.hotel;
        const anzahl =
            where === undefined ? await count() : await count({ where });
        this.#logger.debug('count: %d', anzahl);
        return anzahl;
    }

    async #findAll(
        pageable: Pageable,
    ): Promise<Readonly<Slice<HotelMitStandortDTO>>> {
        const { number, size } = pageable;
        const hotels: HotelMitStandort[] = await prismaClient.hotel.findMany({
            skip: number * size,
            take: size,
            include: this.#includeStandort,
        });
        if (hotels.length === 0) {
            this.#logger.debug('#findAll: Keine Hotels gefunden');
            throw new NotFoundError(`Ungueltige Seite "${number}"`);
        }
        const totalElements = await this.count();
        return this.#createSlice(hotels, totalElements);
    }

    #createSlice(
        hotels: HotelMitStandort[],
        totalElements: number,
    ): Readonly<Slice<HotelMitStandortDTO>> {
        const hotelsDTO = hotels.map((hotel) => {
            // Rest Properties
            const { preis, ...hotelRest } = hotel;
            const hotelDTO: HotelMitStandortDTO = {
                // Spread Properties
                ...hotelRest,
                preis: preis.toNumber(),
            };
            return hotelDTO;
        });
        const hotelSlice: Slice<HotelMitStandortDTO> = {
            content: hotelsDTO,
            totalElements,
        };
        this.#logger.debug('createSlice: hotelSlice=%o', hotelSlice);
        return hotelSlice;
    }

    #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%o', keys);
        // Ist jeder Suchparameter auch eine Property von Hotel oder "schlagwoerter"?
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !suchparameterNamen.includes(key) &&
                key !== 'javascript' &&
                key !== 'typescript' &&
                key !== 'java' &&
                key !== 'python'
            ) {
                this.#logger.debug(
                    '#checkKeys: ungueltiger Suchparameter "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
