
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/streamArray';
import { createReadStream } from 'fs';
import { createCities } from '../database';

import knex from "knex";
import { client } from "../../../..";
import dayjs from 'dayjs';

const db = knex(client.config["database-filename"]);
// {
//     "name": "Sant Julià de Lòria",
//     "lat": "42.46372",
//     "lng": "1.49129",
//     "country": "AD",
//     "admin1": "06",
//     "admin2": ""
// },

export const importCities = async () => {
    console.log('Début du traitement du fichier JSON.');
    const filename = `${__dirname}/../../../../cities.json`;
    const pipeline = createReadStream(filename)
        .pipe(parser())
        .pipe(streamArray());
    
    const cities = [] as Array<any>;
    pipeline.on('data', ({ key, value }) => {
        cities.push(value);
    });
    
    pipeline.on('end', () => {
        console.log('Fin du traitement du fichier JSON.');
        createCities(cities);
    });
}

export const createMessage = async (data: { main: { temp: string; feels_like: string; humidity: string; }; wind: { speed: string; }; }, location: string) => {
    const embed = {
        title: "Weather",
        description: `Weather for ${location.split(',')[0]}`,
        // #4e33f4
        color: 0x4e33f4,
        fields: [
            {
                name: "Temperature",
                value: `${data.main.temp}°C`,
                inline: true
            },
            {
                name: "Feels like",
                value: `${data.main.feels_like}°C`,
                inline: true
            },
            {
                name: "Humidity",
                value: `${data.main.humidity}%`,
                inline: true
            },
            {
                name: "Wind",
                value: `${data.wind.speed}m/s`,
                inline: true
            },
        ]
    }

    return embed;
}

export const createForecastMessage = async (data: { list: Array<any> }, location: string) => {
    const days = data.list.filter(d => d.dt_txt.includes('12:00:00'));
    const embed = {
        title: "Weather forecast",
        description: `Weather forecast for ${location.split(',')[0]}`,
        color: 0x4e33f4,
        fields: days.map((day, index) => {
            return {
                name: `${dayjs(day.dt_txt).format('dddd D MMM')}`,
                value: `- Temp: ${day.main.temp}°C\n- Weather: ${day.weather[0].description}`,
                inline: true
            }
        })
    }

    return embed;
}

export const getCities = async (search: string) => {
    const cities = await db.table("cities").where('name', 'like', `%${search}%`).limit(10);
    const citieslist = (cities as Array<any>).map(city => { 
        
        return {
            name: city.name + (city.admin2 ? ', '+city.admin2 : '') + ', ' + city.country,
            value: city.lat + ',' + city.lng
        }
    })

    return citieslist
}