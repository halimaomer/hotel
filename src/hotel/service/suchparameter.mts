/**
 * Das Modul besteht aus Typdefinitionen für die Suche in `BuchService`.
 * @packageDocumentation
 */

// Typdefinition für `find`
export type Suchparameter = {
    readonly name?: string;
    readonly preis?: number;
};

// gueltige Namen fuer die Suchparameter
export const suchparameterNamen = [
    'name',
    'preis',
];
