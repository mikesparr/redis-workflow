import { EventEmitter } from "events";
import * as redis from "redis";

import { Action, ActionType } from "./lib/Action";
import DelayedAction from "./lib/DelayedAction";
import IAction from "./lib/IAction";
import ImmediateAction from "./lib/ImmediateAction";
import IRule from "./lib/IRule";
import ITrigger from "./lib/ITrigger";
import IWorkflow from "./lib/IWorkflow";
import IWorkflowManager from "./lib/IWorkflowManager";
import RedisConfig from "./lib/RedisConfig";
import Rule from "./lib/Rule";
import Trigger from "./lib/Trigger";
import Workflow from "./lib/Workflow";

export {
    ActionType,
    DelayedAction,
    IAction,
    ImmediateAction,
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
    Error = "error", // fired when Error emitted
    Add = "add", // fired when new workflow added
    Remove = "remove", // fired when workflow removed
    Load = "load", // fired when workflow loaded from db
    Start = "start", // fired when manager started channel
    Stop = "stop", // fired when manager stopped channel
    Schedule = "schedule", // fired when actions are ActionType.Delay
    Immediate = "immediate", // fired when actions are ActionType.Immediate
    Audit = "audit", // fired for all actions
    Kill = "kill", // fired when channel stopped listening
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
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows are required");
        }

        this.workflows = workflows;
    }

    public getWorkflows(): IWorkflow[] {
        return this.workflows || [];
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

    public start(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            // store workflows by trigger name (only if valid trigger name)
            // TODO: potentially convert to cache and if miss, get from workflows
            const triggerMap: {[key: string]: IWorkflow} = {};
            this.workflows.map((flow) => {
                if (flow &&
                    flow !== null &&
                    flow.getTrigger() !== null &&
                    flow.getTrigger().getName() !== null &&
                    flow.getTrigger().getName() !== undefined) {
                        triggerMap[flow.getTrigger().getName()] = flow;
                }
            });

            // handler for incoming messages on channel
            this.subscriber.on("message", (ch: string, message: string) => {
                if (message === this.PUBSUB_KILL_MESSAGE) {
                    this.subscriber.unsubscribe(channel);
                    this.emit(WorkflowEvents.Kill);
                } else if (message && typeof message === "string") {
                    // parse message and extract event
                    try {
                        const jsonMessage: any = JSON.parse(message);
                        const { event, context } = jsonMessage;
                        const activeFlow: IWorkflow = (event && context) ? triggerMap[event] : null;

                        if (activeFlow) {
                            activeFlow.getActionsForContext(context)
                                .then((actions) => {
                                    actions.map((action) => {
                                        action.setContext(context);

                                        if (action && action instanceof DelayedAction) {
                                            this.emit(action.getName(), action); // optionally listen for action by name
                                            this.emit(WorkflowEvents.Schedule, action); // use any scheduler you want
                                            this.emit(WorkflowEvents.Audit, action); // global handler
                                        } else if (action && action instanceof ImmediateAction) {
                                            this.emit(action.getName(), action); // optionally listen for action by name
                                            this.emit(WorkflowEvents.Immediate, action); // handle with default
                                            this.emit(WorkflowEvents.Audit, action); // global handler
                                        } else {
                                            this.emit(
                                                WorkflowEvents.Error,
                                                new TypeError("Action object was null"));
                                        }
                                    });
                                })
                                .catch((error) => {
                                    this.emit(WorkflowEvents.Error, error);
                                });
                        } else {
                            this.emit(
                                WorkflowEvents.Error,
                                new TypeError(`No trigger defined for event '${event}'`));
                        }
                    } catch (error) {
                        this.emit(WorkflowEvents.Error, error);
                    }
                } else {
                    this.emit(
                        WorkflowEvents.Error,
                        new TypeError(`Message ${message} is not valid JSON '{event, context}'`));
                }
            });

            // start listener
            this.subscriber.subscribe(channel, (err: Error, reply: string) => {
                if (err !== null) {
                    throw err;
                }

                this.emit(WorkflowEvents.Start);
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
