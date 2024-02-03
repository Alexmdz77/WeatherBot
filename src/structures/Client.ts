import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from "discord.js";
import type { CommandType } from "../typings/Command";
import type { RegisterCommandsOptions } from "../typings/Client";
import { Event } from "./Event";
import { Database } from "./Database";
import glob from 'glob-promise';
import cron from 'node-cron';
import 'dotenv/config'

import { parse } from 'yaml';
import { readFileSync } from 'fs';
const config = parse(readFileSync('./config.yml', 'utf8')) as any;

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    config: any;
    language: String;

    constructor() {
        super({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.GuildVoiceStates,
        ] });
    }

    start() {
        this.config = config;
        this.registerModules();
        new Database(config["database-filename"]);
        this.login(process.env.BOT_TOKEN);
        this.registerCrons();
    }
    
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registering global commands");
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await glob(`../modules/*/commands/*{.ts,.js}`, { cwd: __dirname });
        for (const filePath of commandFiles) {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            if([2,3].includes(command.type)) delete command.description;
            slashCommands.push(command);
        }
        
        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: config.guildId || null
            });
        });

        // Event
        const eventFiles = await glob(`../modules/*/events/*{.ts,.js}`, { cwd: __dirname });
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            console.log(event);
            this.on(event.event, event.run);
        }
    }

    async registerCrons() {
        const cronFiles = await glob(`../modules/*/crons/*{.ts,.js}`, { cwd: __dirname });
        for (const filePath of cronFiles) {
            const file = await this.importFile(filePath);
            if(!file) return;
            // every hour
            if(file.hourly && file.hourly instanceof Function){
                cron.schedule('0 * * * *', file.hourly);
            }
            // every day
            if(file.daily && file.daily instanceof Function){
                cron.schedule('0 0 * * *', file.daily);
            }
            // every week
            if(file.weekly && file.weekly instanceof Function){
                cron.schedule('0 0 * * 0', file.weekly);
            }
        }
    }

}
