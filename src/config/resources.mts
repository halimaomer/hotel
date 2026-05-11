/**
 * Das Modul enthält Objekte mit Konfigurationsdaten aus der YAML-Datei.
 * @packageDocumentation
 */

import { URL } from 'node:url';
import { styleText } from 'node:util';

// "import.meta" nur bei ESM
// - in package.json das Feld "type" mit dem Wert "module"
// - Dateiendung .mts
// https://nodejs.org/api/esm.html
// http://2ality.com/2017/11/import-meta.html
export const resourcesURL = new URL('resources/', import.meta.url);
let message = styleText(['black', 'bgWhite'], 'resourcesURL:');
console.log(`${message} ${resourcesURL}`);
