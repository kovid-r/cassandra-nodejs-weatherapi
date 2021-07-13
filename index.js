'use strict'
const {
    Client
} = require("cassandra-driver");
const lib = require('weatherapilib');
const config = require('config');
const uuid = require('uuid');
const asy = require('async');
const { get } = require("config");

lib.Configuration.key = config.get('apiKey');
const astraConfig = config.get('dbSettings');
const requestBatchSize = config.get('requestBatchSize');
const insertBatchSize = config.get('insertBatchSize');
const language = config.get('language');
const getWeatherDataFreqMs = config.get('getWeatherDataFreqMs');
const getWeatherDataDurationMs = config.get('getWeatherDataDurationMs');

const controller = lib.APIsController;
const places = config.get('placeCodes');
let consoleLogFlag = 0;
let getDataTs = null;

/**
 * Main function
 * Fetches the data from WeatherAPI.com in batches
 * The batch size for fetching data is defined by requestBatchSize. It can be set in config/default.json file.
 * Inserts the fetched data into Astra.
 * @return {*} 
 */
function main() {
    asy.mapLimit(places, requestBatchSize, function (place, callback) {
        requestData(place).then((response) => {
            const insertObject = {
                id: uuid.v4(),
                city: response.location.name,
                region: response.location.region,
                country: response.location.country,
                lat: response.location.lat,
                lon: response.location.lon,
                tzid: response.location.tzId,
                temp_c: response.current.tempC,
                temp_f: response.current.tempF,
                condition: response.current.condition.text,
                wind_mph: response.current.windMph,
                wind_kph: response.current.windKph,
                wind_degree: response.current.windDegree,
                wind_direction: response.current.windDir,
                pressure_mb: response.current.pressureMb,
                pressure_in: response.current.pressureIn,
                precipitation_mm: response.current.precipMm,
                precipitation_in: response.current.precipIn,
                humidity: response.current.humidity,
                cloud: response.current.cloud,
                feelslike_c: response.current.feelslikeC,
                feelslike_f: response.current.feelslikeF,
                visibility_km: response.current.visKm,
                visibility_m: response.current.visMiles,
                uv: response.current.uv,
                gust_mph: response.current.gustMph,
                gust_kph: response.current.gustKph,
                apicall_epoch: response.location.localtimeEpoch,
                apicall_dt: response.location.localtime,
                lastupdated_epoch: response.current.lastUpdatedEpoch,
                lastupdated_dt: response.current.lastUpdated
            };
            if (consoleLogFlag == 0) {
                console.log(place);
            }
            callback(null, insertObject);
        }).catch(() => {
            callback(null);

        });
    }, (err, results) => {
        if (err) console.error(err)
        consoleLogFlag = 1;
        getDataTs = Date.now();
        console.log("Records fetched from weatherapi.com at", getDataTs);
        parallelInsert(results, getDataTs);
    })
}

/**
 * Reads data from WeatherAPI.com
 * @param {*} place -- Place code of the location to fetch the weather data.
 * @return {Promise}
 */
async function requestData(place) {
    return controller.getRealtimeWeather(place, language);
}

/**
 * Executes a SQL query on Astra
 * @param {*} data -- object with the weather data returned by WeatherAPI.com
 * @param {*} client -- Astra client object containing connection details
 * @return {*} 
 */
async function insertData(data, client) {
    const insertQuery = 'INSERT INTO realtime.weather (id, city, region, country, lat, lon, tzid, temp_c, temp_f, condition, wind_mph, wind_kph, wind_degree, wind_direction, pressure_mb, pressure_in, precipitation_mm, precipitation_in, humidity, cloud, feelslike_c, feelslike_f, visibility_km, visibility_m, uv, gust_mph, gust_kph, apicall_epoch, apicall_dt, lastupdated_epoch, lastupdated_dt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertQueryParams = [data.id, data.city, data.region, data.country, data.lat, data.lon, data.tzid, data.temp_c, data.temp_f, data.condition, data.wind_mph, data.wind_kph, data.wind_degree, data.wind_direction, data.pressure_mb, data.pressure_in, data.precipitation_mm, data.precipitation_in, data.humidity, data.cloud, data.feelslike_c, data.feelslike_f, data.visibility_km, data.visibility_m, data.uv, data.gust_mph, data.gust_kph, data.apicall_epoch, data.apicall_dt, data.lastupdated_epoch, data.lastupdated_dt];
    return client.execute(insertQuery, insertQueryParams, {
        prepare: true
    });
}

/**
 * Groups multiple inserts into one batch
 * The batch size is defined by insertBatchSize. It can be set in config/default.json file.
 * @param {*} results
 */
function parallelInsert(results, dataTs) {

    const client = new Client(
        astraConfig
    );

    client.connect().then(() => {
        asy.eachLimit(results, insertBatchSize, function (weatherData, callback) {
            if (!weatherData) {
                setTimeout(() => {
                    callback(null);
                }, 0);
            } else {
                setTimeout(() => {
                    insertData(weatherData, client).then(() => {
                        callback(null);
                    });
                }, 0);
            }
        }, (err) => {
            if (err) console.error(err)
            try {
                console.log("Records fetched at", dataTs, "inserted into Cassandra at", Date.now());
                client.shutdown();
            } catch (e) {
                console.log("Process terminated with error: ", e)
            }
        });
    });
}

const setIntervalRef = setInterval(main, getWeatherDataFreqMs);
setTimeout(() => clearInterval(setIntervalRef), getWeatherDataDurationMs);