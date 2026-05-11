/**
 * Das Modul besteht aus der Funktion {@linkcode getLogger} für einen Logger auf
 * der Basis von Pino: https://getpino.io.
 * @packageDocumentation
 */

import type pino from 'pino';
import { parentLogger } from '../config/logger.mts';

/**
 * Eine Funktion, um ein Logger-Objekt von `Pino` zu erzeugen, so dass ein
 * _Kontext_ definiert wird, der bei jeder Log-Methode verwendet wird und z.B.
 * der Name einer eigenen Klasse (Default), einer Funktion oder einer Datei ist.
 * @param context Der Kontext
 * @param kind i.a. `class`, `func` oder `file`
 *
 * @author [Halima Omer](mailto:omha1011@h-ka.de)
 */
export const getLogger: (
    context: string,
    kind?: string,
) => pino.Logger<string> = (context: string, kind = 'class') => {
    const bindings: Record<string, string> = {};
    // "indexed access" auf eine Property, deren Name als Wert im Argument "kind" uebergeben wird
    // eslint-disable-next-line security/detect-object-injection
    bindings[kind] = context;
    // https://getpino.io/#/docs/child-loggers
    return parentLogger.child(bindings);
};
