import { EventEmitter } from "events";
import * as redis from "redis";
import Action from "./lib/Action";
import IAction from "./lib/IAction";
import IRule from "./lib/IRule";
import ITrigger from "./lib/ITrigger";
import IWorkflow from "./lib/IWorkflow";
import IWorkflowManager from "./lib/IWorkflowManager";
import RedisConfig from "./lib/RedisConfig";
import Rule from "./lib/Rule";
import Trigger from "./lib/Trigger";
import Workflow from "./lib/Workflow";

export {
    Action,
    IAction,
    IRule,
    ITrigger,
    IWorkflow,
    IWorkflowManager,
    RedisConfig,
    Rule,
    Trigger,
    Workflow,
};

export enum WorkflowEvents {
    Error = "error",
    Add = "add",
    Remove = "remove",
    Load = "load",
    Run = "run",
    Stop = "stop",
    Kill = "kill",
}

export class RedisWorkflowManager extends EventEmitter implements IWorkflowManager {
    protected client: redis.RedisClient;
    protected subscriber: redis.RedisClient;
    protected workflows: IWorkflow[];

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

    public setWorkflows(workflows: IWorkflow[]): void {
        this.workflows = workflows;
    }

    public getWorkflows(): IWorkflow[] {
        return this.workflows;
    }

    public addWorkflow(channel: string, workflow: IWorkflow): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }
            if (typeof workflow !== "object") {
                throw new TypeError("Workflow is required");
            }

            // add workflow or create if non-existant
            this.workflows ? this.workflows.push(workflow) : this.workflows = [workflow];

            this.emit(WorkflowEvents.Add);
            resolve();
        });
    }

    public run(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            // default handler
            this.subscriber.on("message", (ch: string, message: string) => {
                if (message === this.PUBSUB_KILL_MESSAGE) {
                    this.subscriber.unsubscribe(channel);
                    this.emit(WorkflowEvents.Kill);
                } else {
                    // parse message and extract event

                    // if invalid event object, emit error

                    // if valid trigger, apply condition and then emit action(s)

                    this.emit(message); // test
                }
            });

            // get all triggers, rules, actions for channel workflows

            // start listener
            this.subscriber.subscribe(channel, (err: Error, reply: string) => {
                if (err !== null) {
                    throw err;
                }

                this.emit(WorkflowEvents.Run);
                resolve();
            });
        });
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

    protected loadWorkflowsFromDatabase(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            this.emit(WorkflowEvents.Load);
            resolve();
        });
    }
}
