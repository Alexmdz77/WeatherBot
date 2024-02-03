import { Event } from "../../../structures/Event";
import { importCities } from "../helpers";

export default new Event("ready", () => {
    console.log('✅', '\x1b[32m Bot is online \x1b[0m');
    importCities();
});
