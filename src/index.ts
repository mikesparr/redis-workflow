import * as redis from "redis";

export interface IWorkflow<T> {
    length(channel: string): Promise<number>;
    isEmpty(channel: string): Promise<boolean>;
}

export class RedisConfig {
    public host: string;
    public port: number;
    public db: number;
    public password: string;

    constructor(host: string, port: number, db?: number, password?: string) {
        this.host = host;
        this.port = port;
        this.db = db ? db : null;
        this.password = password ? password : null;
    }
}

export class RedisWorkflow implements IWorkflow<string> {
    protected client: redis.RedisClient;
    protected readonly DEFAULT_REDIS_HOST: string = "localhost";
    protected readonly DEFAULT_REDIS_PORT: number = 6379;
    protected readonly ENTRY_TYPE: string = "entries";
    protected readonly PEER_TYPE: string = "peers";

    constructor(config: RedisConfig, client?: redis.RedisClient) {
        if (client && client instanceof redis.RedisClient) {
            this.client = client;
        } else {
            // build properties for instantiating Redis
            const options: {[key: string]: any} = {
                host: config.host || this.DEFAULT_REDIS_HOST,
                port: config.port || this.DEFAULT_REDIS_PORT,
                retry_strategy: (status: any) => {
                    if (status.error && status.error.code === "ECONNREFUSED") {
                        // End reconnecting on a specific error and flush all commands with
                        // a individual error
                        return new Error("The server refused the connection");
                    }
                    if (status.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands
                        // with a individual error
                        return new Error("Retry time exhausted");
                    }
                    if (status.attempt > 10) {
                        // End reconnecting with built in error
                        return undefined;
                    }
                    // reconnect after
                    return Math.min(status.attempt * 100, 3000);
                },
            };
            if (config.db) { options.db = config.db; }
            if (config.password) { options.password = config.password; }

            this.client = redis.createClient(options);
        }
    }

    public length(channel: string): Promise<number> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.client.zcard([channel, this.PEER_TYPE].join(":"), (err: Error, reply: number) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(reply);
            });
        });
    }

    public isEmpty(channel: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.client.zcard([channel, this.PEER_TYPE].join(":"), (err: Error, reply: number) => {
                if (err !== null) {
                    reject(err);
                }

                resolve(reply === 0);
            });
        });
    }
}
