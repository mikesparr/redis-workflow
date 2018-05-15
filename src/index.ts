import { EventEmitter } from "events";
import * as redis from "redis";
import Action from "./lib/Action";
import IWorkflow from "./lib/IWorkflow";
import RedisConfig from "./lib/RedisConfig";
import Rule from "./lib/Rule";
import Trigger from "./lib/Trigger";

export {
    IWorkflow,
    RedisConfig,
};

export enum WorkflowEvents {
    Error = "error",
    Add = "add",
    Remove = "remove",
    Load = "load",
    Run = "run",
    Stop = "stop",
}

export class RedisWorkflow extends EventEmitter implements IWorkflow {
    protected client: redis.RedisClient;
    protected readonly DEFAULT_REDIS_HOST: string = "localhost";
    protected readonly DEFAULT_REDIS_PORT: number = 6379;

    constructor(config: RedisConfig, client?: redis.RedisClient) {
        super();

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

    public add(channel: string, name: string, trigger: Trigger, rules: [Rule], actions: [Action]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (typeof name !== "string") {
                throw new TypeError("Name parameter must be a string");
            }
            if (trigger ! instanceof Trigger) {
                throw new TypeError("Trigger parameter must be a Trigger");
            }
            if (rules ! instanceof Array) {
                throw new TypeError("Rules parameter must be an Array<Rule>");
            }
            if (actions ! instanceof Array) {
                throw new TypeError("Actions parameter must be a Array<Action>");
            }

            this.emit(WorkflowEvents.Add);
            resolve();
        });
    }

    public remove(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.emit(WorkflowEvents.Remove);
            resolve();
        });
    }

    public load(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.emit(WorkflowEvents.Load);
            resolve();
        });
    }

    public run(channel: string, events?: (err: Error, event: any) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            // get all workflows for channel

            // start listener

            this.emit(WorkflowEvents.Run);
            resolve();
        });
    }

    public stop(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.emit(WorkflowEvents.Stop);
            resolve();
        });
    }
}
