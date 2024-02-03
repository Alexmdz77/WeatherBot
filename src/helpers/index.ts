import { client } from "../../index";

export function interpolate(str: string, vars: { [x: string]: any; }) {
    for (let key in vars) {
        str = str.replace(new RegExp(`%${key}%`, 'g'), vars[key]);
    }
    return str;
}

export async function lang(guilddb: any, key: string, replacement?: { [key: string]: string }): Promise<string> {
    
    const language = guilddb.language || client.config.language
    delete require.cache[require.resolve(`../../lang/${language}.json`)];
    const lang = require("../../lang/"+language);

    replacement = {...client.config.emojis, ...replacement}
    let targetValue = !key || typeof key !== "string" ? // Path null ou non string 
    lang : key.split('.').reduce((o: { [x: string]: any; }, i: string | number) => { // Conversion du path en array et parcours de l'objet
            if (!o || !o[i]) { // key non trouvé
                return console.error("Key does not exist : "+key);
            }
            return o[i];
    }, lang);
    if (replacement) {
        for (const [key, value] of Object.entries(replacement)) {
            const re = new RegExp(`\\$${key}`, 'g');
            targetValue = targetValue.replace(re, value)
        }
    }
    return targetValue
}