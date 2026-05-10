
/**
 * Das Modul enthält Objekte mit Daten aus Umgebungsvariablen.
 * @packageDocumentation
 */

import process from 'node:process';
import { styleText } from 'node:util';

const { NODE_ENV, CLIENT_SECRET, LOG_LEVEL } = process.env;

// "as const" fuer readonly
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions

export type EnvType = {
    NODE_ENV: string | undefined;
    CLIENT_SECRET: string | undefined;
    LOG_LEVEL: string | undefined;
};

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Umgebungsvariable zur Konfiguration
 */
export const env: EnvType = {
    // Umgebungsvariable `NODE_ENV` als gleichnamige Konstante, die i.a. einen der
    // folgenden Werte enthält:
    // - `production`, z.B. in einer Cloud,
    // - `development` oder
    // - `test`
    NODE_ENV,
    CLIENT_SECRET,
    LOG_LEVEL,
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

let message = styleText(['black', 'bgWhite'], 'NODE_ENV:');
console.log(`${message} ${NODE_ENV}`);
