SET default_tablespace = hotelspace;

CREATE SCHEMA IF NOT EXISTS AUTHORIZATION hotel;

ALTER ROLE hotel SET search_path = 'hotel';
set search_path to 'hotel';

CREATE TABLE IF NOT EXISTS hotel (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    version       integer NOT NULL DEFAULT 0,
    name          text NOT NULL UNIQUE,
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standort (
    id          integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    strasse     text NOT NULL,
    hausnummer  text NOT NULL,
    plz         text NOT NULL CHECK (plz ~ '\d{5}'),
    ort         text NOT NULL,
    land        text NOT NULL,
    hotel_id    integer NOT NULL UNIQUE REFERENCES hotel ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS zimmer (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    preis           decimal(8,2) NOT NULL,
    zimmernummer    text NOT NULL,
    hotel_id        integer NOT NULL REFERENCES hotel ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS zimmer_hotel_id_idx ON zimmer(hotel_id);

CREATE TABLE IF NOT EXISTS hotel_file (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    data            bytea NOT NULL,
    filename        text NOT NULL,
    mimetype        text,
    hotel_id        integer NOT NULL UNIQUE REFERENCES hotel ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS hotel_file_hotel_id_idx ON hotel_file(hotel_id);
