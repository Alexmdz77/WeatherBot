import { TextChannel } from "discord.js";
import { client } from "../../../..";
import { deleteMeteo, getMeteoMessages, updateMeteoMessage } from "../database";
import fetch from "node-fetch";
import { createMessage } from "../helpers";

const hourly = async () => {
    // check if there are any meteo messages that are older than 24 hours in the database and edit them
    // to update the weather

    // get the meteo messages
    const meteoMessages = await getMeteoMessages('hourly');

    // for each message, update the weather
    for (const meteo of meteoMessages) {
        // get the message
        const channel = client.channels.cache.get(meteo.channelId);
        if (channel instanceof TextChannel) {
            const message = await channel.messages.fetch(meteo.messageId);
            if (!message) {
                // if the message is not found, delete it from the database
                await deleteMeteo(meteo);
                continue;
            }
            const location = meteo.location;
            
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.split(',')[1]}&lon=${location.split(',')[2]}&units=metric&appid=${process.env.WEATHER_API_KEY}`);
            const data = await response.json();

            // get the new message
            const newMessage = await createMessage(data, location);

            // update the message
            await message.edit({embeds: [newMessage]});

            // update the database
            await updateMeteoMessage(meteo);
        }
    }
}

export default {hourly};