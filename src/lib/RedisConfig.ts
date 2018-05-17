export default class RedisConfig {
    public host: string;
    public port: number;
    public db: number;
    public password: string;

    constructor(host: string, port: number, db?: number, password?: string) {
        this.host = host;
        this.port = port;

        if (db >= 0) {
            this.db = db;
        }

        if (password) {
            this.password = password;
        }
    }

    public setHost(host: string): RedisConfig {
        if (!host || typeof host !== "string") {
            throw new TypeError("Host must be a valid string");
        }

        this.host = host;
        return this;
    }

    public setPort(port: number): RedisConfig {
        if (!port || typeof port !== "number") {
            throw new TypeError("Port must be a number");
        }

        this.port = port;
        return this;
    }

    public setDb(id: number): RedisConfig {
        if (!id || typeof id !== "number") {
            throw new TypeError("Database id must be a number");
        }

        this.db = id;
        return this;
    }

    public setPassword(password: string): RedisConfig {
        if (!password || typeof password !== "string") {
            throw new TypeError("Password must be a valid string");
        }

        this.password = password;
        return this;
    }
}
