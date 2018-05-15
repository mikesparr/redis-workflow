import { EventEmitter } from "events";
import * as redis from "redis";
import Action from "./lib/Action";
import IAction from "./lib/IAction";
import IRule from "./lib/IRule";
import ITrigger from "./lib/ITrigger";
import IWorkflow from "./lib/IWorkflow";
import RedisConfig from "./lib/RedisConfig";
import Rule from "./lib/Rule";
import Trigger from "./lib/Trigger";

export {
    IAction,
    IRule,
    ITrigger,
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
    Kill = "kill"
}

export class RedisWorkflow extends EventEmitter implements IWorkflow {
    protected client: redis.RedisClient;
    protected subscriber: redis.RedisClient;
    protected readonly DEFAULT_REDIS_HOST: string = "localhost";
    protected readonly DEFAULT_REDIS_PORT: number = 6379;
    protected readonly PUBSUB_KILL_MESSAGE: string = "WFKILL";

    constructor(config: RedisConfig, client?: redis.RedisClient) {
        super();

        if (client && client instanceof redis.RedisClient) {
            this.client = client;
            this.subscriber = client;
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
            this.subscriber = redis.createClient(options);
        }
    }

    public add(channel: string, name: string, trigger: ITrigger, rules: [IRule], actions: [IAction]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (typeof name !== "string") {
                throw new TypeError("Name parameter must be a string");
            }
            if (trigger ! instanceof Trigger) {
                throw new TypeError("Trigger parameter must be an ITrigger");
            }
            if (rules ! instanceof Array) {
                throw new TypeError("Rules parameter must be an Array<IRule>");
            }
            if (actions ! instanceof Array) {
                throw new TypeError("Actions parameter must be a Array<IAction>");
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

    public run(channel: string): void {
        if (typeof channel !== "string") {
            throw new TypeError("Channel parameter must be a string");
        }

        // get all workflows for channel

        // default handler
        this.subscriber.on("message", (channel: string, message: string) => {
            console.log({channel, message});

            if (message === this.PUBSUB_KILL_MESSAGE) {
                console.log(`Kill message detected. Shutting down...`);
                this.subscriber.unsubscribe(channel);
                this.emit(WorkflowEvents.Kill);
                //process.exit(0);
            } else {
                // parse message and extract event

                // if invalid event object, emit error

                // if valid trigger, apply condition and then emit action(s)

                console.log(`Received message ${message}`);
                this.emit(message); // test
            }
        });

        // start listener
        this.emit(WorkflowEvents.Run);
        this.subscriber.subscribe(channel);
    }

    public stop(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            // publish kill message to channel
            this.client.publish(channel, this.PUBSUB_KILL_MESSAGE, (err: Error, reply: number) => {
                this.emit(WorkflowEvents.Stop);
                resolve();
            });
        });
    }
}
