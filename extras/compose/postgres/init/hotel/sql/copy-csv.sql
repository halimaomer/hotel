SET search_path TO hotel;

COPY hotel FROM '/init/hotel/csv/hotel.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY standort FROM '/init/hotel/csv/standort.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY zimmer FROM '/init/hotel/csv/zimmer.csv' (FORMAT csv, DELIMITER ';', HEADER true);
