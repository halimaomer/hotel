/**
 * Error-Klasse für fehlende Authorisierung.
 */
export class UnauthorizedError extends Error {}

/**
 * Error-Klasse für fehlende Berechtigung.
 */
export class ForbiddenError extends Error {}

/**
 * Error-Klasse für internen Fehler.
 */
export class InternalServerError extends Error {}
