# Realtime Weather with Node.js and Cassandra

A minimal Node.js application to fetch and ingest realtime weather data into Cassandra from WeatherAPI.com.

## Installation

Download and install Node.js from the [official website](https://nodejs.org/en/download/). The default package manager for Node.js comes pre-installed with the Node.js installation.

Clone the [WeatherAPI.com Node.js SDK](https://github.com/weatherapicom/weatherapi-Node-js) repository and run the following command in the root folder of the repository

```
npm link
```

Clone this repository and go to `/path/to/repository` and run the following command to install the dependencies mentioned in `package.json` file.

```
npm install
```

Run the following command to link the relevant Node.js library from the WeatherAPI.com Node.js SDK:

```
npm link weatherapilib
```
> Note: You will need to run the above command every time after you run npm install.

## Initialize the Database

Visit [DataStax Astra's website](https://astra.datastax.com) to create a free account and access to Cassandra-as-a-Service. Once the account is created, create a database called **weatherapi**. You can access the database using the CQLSH in-browser command-line interface. Use the CLI to run the commands in the `initialize.sql` file. The commands will create
* A `KEYSPACE` called **realtime**, and
* A `TABLE` in that keyspace called **weather**.

## Authentication

When you visit the Astra webpage and go to the database tab and click on the database you just created, you will see the following format of the URL:

```https://astra.datastax.com/org/{USER-ID}/database/{ASTRA-DATABASE-ID}```

Fetch the Astra Database ID and go to the following link using that ID:

```https://astra.datastax.com/org/{ASTRA-DATABASE-ID}/settings/tokens```

Use the official [Astra documentation for Node.js](https://docs.datastax.com/en/astra/docs/connecting-to-your-database-with-the-datastax-nodejs-driver.html) to download the secure bundle and to create an authentication token. The authentication token will give you `clientId` and `clientSecret`.

Replace the following values in the `default.json` file for configuring Astra and WeatherAPI.com API:
1. `path/to/secure-connect-database_name.place`
2. `clientId`
3. `clientSecret`
4. `apiKey` -- use this to enter the API key from WeatherAPI.com.

Make sure you do not commit the `default.json` file back with real values.

## Usage

You can configure the following values in the `default.json` file.

1. `requestBatchSize` - Number of place codes, cities, or locations you want to fetch in a single batch. This defaults to 2000.
2. `insertBatchSize` - Number of records you want to insert into Cassandra in a single batch. This, too, defaults to 2000.
3. `language` - It is a mandatory field required in the `GET` request by the WeatherAPI.com API. It defaults to `en`. Use the [official documentation](https://www.weatherapi.com/docs/) to get more information about other supported languages.

You can configure the location of the weather information you want to fetch in the `development.json` file using one or more of the the following options (the list/array in the JSON can be heterogeneous) to populate the `placeCodes` key.

1. Latitude, Longitude (Decimal degree) e.g: q=48.8567,2.3508
2. City name - Paris, Melbourne, New Delhi
3. zip code (for UK, USA, or Canada) - SW1, G2J
4. meter or iata codes
5. IP address

The `placeCodes` key currently defaults a mix of all of the above location types.

If you have set all of this, you are good to go and ready to start fetching data from the WeatherAPI.com API and insert it into Cassandra by using the following command:

```
npm start
```

Special thanks to @chirag-vashisht for helping out with the code.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)