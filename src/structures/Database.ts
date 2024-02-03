import glob from "glob-promise";
import knex from "knex";

export class Database {
    constructor(database: string) {
        const knexInstance = this.connectSqlite(database);
    }

    async connectSqlite(databaseFilename: string) {
        if(!databaseFilename) throw new Error('No database-filename provided');
        let migrationsFiles = await glob(`../modules/*/migrations/`, { cwd: __dirname });
        migrationsFiles = migrationsFiles.map((file: string) => __dirname.replace(/\\/g, '/')+"/"+file.replace(/\\/g, '/'))
        const database = knex({
            client: 'sqlite3',
            connection: {
              filename: databaseFilename,
            },
            migrations: {
                directory: migrationsFiles
            },
            useNullAsDefault: true
          });
        console.log('Connected to database:', databaseFilename);
        database.migrate.latest();
        console.log('Running migrations:', migrationsFiles.map((file: string) => file.split('/')[file.split('/').length-3]));
        return database;
    }

    async importFile(filePath: string) {
        return import(filePath);
    }
}