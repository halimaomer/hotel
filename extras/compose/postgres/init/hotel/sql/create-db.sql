CREATE USER hotel PASSWORD 'p';

CREATE DATABASE hotel;

GRANT ALL ON DATABASE hotel TO hotel;

CREATE TABLESPACE hotelspace OWNER hotel LOCATION '/tablespace/hotel';
