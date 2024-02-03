import knex from "knex";
import { client } from "../../../..";

const db = knex(client.config["database-filename"]);

interface IMeteo {
    guildId: string;
    channelId: string;
    authorId: string;
    messageId?: string;
    type: "embed" | "channel";
    location: string;
}

export const updateMeteoLocation = async (meteo: IMeteo) => {
    let meteoDB = undefined;
    if(meteo.messageId) {
        meteoDB = await db.table("meteo").where({guildId: meteo.guildId, channelId: meteo.channelId, messageId: meteo.messageId}).first();
        await db.table("meteo").where({
            guildId: meteo.guildId, 
            channelId: meteo.channelId, 
            messageId: meteo.messageId
        }).update({
            location: meteo.location,
            updatedAt: new Date().toISOString()
        });
    } else {
        meteoDB = await db.table("meteo").where({guildId: meteo.guildId, channelId: meteo.channelId}).first();
        await db.table("meteo").where({
            guildId: meteo.guildId, 
            channelId: meteo.channelId
        }).update({
            location: meteo.location,
            updatedAt: new Date().toISOString()
        });
    }
}

export const getMeteo = async (meteo: IMeteo) => { 
    // get the author from the database
    const meteoDB = await db.table("meteo").where({
        guildId: meteo.guildId, 
        channelId: meteo.channelId,
        messageId: meteo.messageId
    }).first();
    if(!meteoDB) return null;
    return meteoDB;
}

export const createMeteo = async (meteo: IMeteo) => {
    await db.table("meteo").insert({
        ...meteo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
}

export const createCities = async (cities: Array<any>) => {
    const chunkSize = 500;
    console.log('Début de l\'insertion des villes.');

    for (let i = 0; i < cities.length; i += chunkSize) {
        const chunk = cities.slice(i, i + chunkSize);
        try {
            await db.batchInsert("cities", chunk, chunkSize);
        } catch (error) {
            console.log(error);
        }
    }

    console.log('Fin de l\'insertion des villes.');
}

export const getMeteoMessages = async (period: string) => {
    let lastUpdate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    switch(period) {
        case 'hourly':
            lastUpdate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            break;
        case 'daily':
            lastUpdate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'weekly':
            lastUpdate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
    }
    const meteoMessages = await db.table("meteo").where('updatedAt', '<', lastUpdate);
    return meteoMessages;
}

export const deleteMeteo = async (meteo: IMeteo) => {
    await db.table("meteo").where({
        guildId: meteo.guildId, 
        channelId: meteo.channelId, 
        messageId: meteo.messageId
    }).delete();
}

export const updateMeteoMessage = async (meteo: IMeteo) => {
    await db.table("meteo").where({
        guildId: meteo.guildId, 
        channelId: meteo.channelId, 
        messageId: meteo.messageId
    }).update({
        updatedAt: new Date().toISOString()
    });
}