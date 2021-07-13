-- Manually Create Keyspace by logging into your Astra account by accessing the CQLSH console
CREATE KEYSPACE IF NOT EXISTS realtime WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 1};

-- Create a table to realtime weather data
CREATE TABLE realtime.weather (
    id UUID PRIMARY KEY, 
    city TEXT, 
    region TEXT, 
    country TEXT,
    lat DOUBLE,
    lon DOUBLE,
    tzid TEXT,
    temp_c DOUBLE,
    temp_f DOUBLE,
    condition TEXT,
    wind_mph DOUBLE,
    wind_kph DOUBLE,
    wind_degree DOUBLE,
    wind_direction TEXT,
    pressure_mb DOUBLE,
    pressure_in DOUBLE,
    precipitation_mm INT,
    precipitation_in INT,
    humidity INT,
    cloud INT,
    feelslike_c DOUBLE,
    feelslike_f DOUBLE,
    visibility_km DOUBLE,
    visibility_m DOUBLE,
    uv INT,
    gust_mph DOUBLE,
    gust_kph DOUBLE,
    apicall_epoch BIGINT,
    apicall_dt TEXT,
    lastupdated_epoch BIGINT,
    lastupdated_dt TEXT
    );