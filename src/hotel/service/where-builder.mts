/**
 * Das Modul besteht aus der Klasse {@linkcode WhereBuilder}.
 * @packageDocumentation
 */

import { type HotelWhereInput } from '../../generated/prisma/models/Hotel.ts';
import { type Suchparameter } from './suchparameter.mts';
import { getLogger } from '../../logger/logger.mts';

/** Typdefinitionen für die Suche mit der Hotel-ID. */
export type BuildIdParams = {
    /** ID des gesuchten Hotels. */
    readonly id: number;
    /** Sollen die Zimmer mitgeladen werden? */
    readonly mitZimmern?: boolean;
};

const logger = getLogger('buildWher', 'func');

/**
 * WHERE-Klausel für die flexible Suche nach Hotels bauen.
 * @param suchparameter JSON-Objekt mit Suchparameter.
 * @returns HotelWhereInput
 */
export const buildWhere = ({
    ...restProps
}: Suchparameter) => {
    logger.debug(
        'build: restProps=%o',
        restProps,
    );

    const where: HotelWhereInput = {};

    Object.entries(restProps).forEach(([key, value]) => {
        switch (key) {
            case 'name':
                where.name = { equals: value as string };
                break;
        }
    });

    logger.debug('build: where=%o', where);
    return where;
};
