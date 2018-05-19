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
    Save = "save", // fired when workflow saved in db
    Delete = "delete", // fired when workflow deleted from db
    Ready = "ready", // fired when manager instantiated
    Start = "start", // fired when manager started channel
    Stop = "stop", // fired when manager stopped channel
    Reset = "reset", // fired when reset
    Schedule = "schedule", // fired when actions are ActionType.Delay
    Immediate = "immediate", // fired when actions are ActionType.Immediate
    Audit = "audit", // fired for all actions
    Kill = "kill", // fired when channel stopped listening
}

export class RedisWorkflowManager extends EventEmitter implements IWorkflowManager {
    protected client: redis.RedisClient;
    protected subscriber: redis.RedisClient;
    protected workflows: Dictionary; // hashmap of channel, IWorkflow[]

    protected readonly DEFAULT_REDIS_HOST: string = "localhost";
    protected readonly DEFAULT_REDIS_PORT: number = 6379;
    protected readonly PUBSUB_KILL_MESSAGE: string = "WFKILL";
    protected readonly REDIS_WORKFLOW_KEY_SUFFIX: string = "workflows";

    constructor(config: RedisConfig, client?: redis.RedisClient, channels?: string[]) {
        super();

        if (config && typeof config !== "object") {
            throw new TypeError("Config must be null or a valid RedisConfig");
        }
        if (client && typeof client !== "object") {
            throw new TypeError("Client must be null or a valid RedisClient");
        }
        if (channels && channels.length === 0) {
            throw new TypeError("Channels must be valid array of at least one string");
        }

        if (client && client instanceof redis.RedisClient) {
            this.client = client;
            this.subscriber = client;
        } else {
            // build properties for instantiating Redis
            const options: Dictionary = {
                host: config.host || this.DEFAULT_REDIS_HOST,
                port: config.port || this.DEFAULT_REDIS_PORT,
                retry_strategy: (status: any) => {
                    if (status.error && status.error.code === "ECONNREFUSED") {
                        // End reconnecting on a specific error and flush all commands
                        return new Error("The server refused the connection");
                    }
                    if (status.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands
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

        // initiate workflows hash
        this.workflows = {};

        // check if channels declared, and load from db
        if (channels) {
            const jobs: Array<Promise<void>> = [];

            channels.map((ch) => {
                jobs.push(this.loadWorkflowsFromDatabase(ch));
            });

            // process them
            Promise.all(jobs)
                .then((values: any[]) => {
                    this.emit(WorkflowEvents.Ready);
                })
                .catch((error) => {
                    this.emit(WorkflowEvents.Error, (error));
                });
        }
    }

    public setWorkflows(workflows: Dictionary): void {
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows must be a valid object");
        }

        this.workflows = workflows;
    }

    public setWorkflowsForChannel(channel: string, workflows: IWorkflow[]): void {
        if (typeof workflows !== "object") {
            throw new TypeError("Workflows must be a valid object");
        }

        this.workflows[channel] = workflows;
    }

    public getWorkflows(): Dictionary {
        return this.workflows || {};
    }

    public getWorkflowsForChannel(channel: string): IWorkflow[] {
        if (typeof channel !== "string") {
            throw new TypeError("Channel must be a valid string");
        }
        if (!this.workflows) {
            throw new Error("You haven't defined any workflows yet");
        }
        if (this.workflows && !this.workflows[channel]) {
            throw new Error("No workflows exist for that channel");
        }

        return this.workflows[channel];
    }

    public addWorkflow(channel: string, workflow: IWorkflow): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!channel || typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!workflow || typeof workflow !== "object") {
                throw new TypeError("Workflow is required");
            }

            // add workflow or create if non-existant
            if (!this.workflows) {
                this.workflows = { [channel]: [workflow] };
            } else if (this.workflows && !this.workflows[channel]) {
                this.workflows[channel] = [workflow];
            } else {
                this.workflows[channel].push(workflow);
            }

            // save to database
            this.saveWorkflowsToDatabase(channel)
                .then(() => {
                    this.emit(WorkflowEvents.Add);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public removeWorkflow(channel: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!channel || typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!name || typeof name !== "string") {
                throw new TypeError("Name must be a valid string");
            }

            // remove workflow if it exists
            if (this.workflows && this.workflows[channel]) {
                let channelFlow: IWorkflow[] = this.workflows[channel];
                channelFlow = channelFlow.filter((flow: IWorkflow) => flow.getName() !== name);
                this.workflows[channel] = channelFlow;
            }

            this.emit(WorkflowEvents.Remove);
            resolve();
        });
    }

    public start(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel must be a valid string");
            }
            if (!this.workflows) {
                throw new Error("You haven't defined any workflows yet");
            }
            if (this.workflows && !this.workflows[channel]) {
                throw new Error("No workflows exist for that channel");
            }

            // store workflows by trigger name (only if valid trigger name)
            // TODO: potentially convert to cache and if miss, get from workflows
            const triggerMap: {[key: string]: IWorkflow} = {};
            this.workflows[channel].map((flow: IWorkflow) => {
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
                if (ch === channel) {
                    if (message === this.PUBSUB_KILL_MESSAGE) {
                        this.subscriber.unsubscribe(channel);
                        this.emit(WorkflowEvents.Kill, channel);
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
                                                 // optionally listen for action by name
                                                this.emit(action.getName(), action);
                                                // use any scheduler you want
                                                this.emit(WorkflowEvents.Schedule, action);
                                                // global handler
                                                this.emit(WorkflowEvents.Audit, action);
                                            } else if (action && action instanceof ImmediateAction) {
                                                 // optionally listen for action by name
                                                 this.emit(action.getName(), action);
                                                 // use any scheduler you want
                                                 this.emit(WorkflowEvents.Immediate, action);
                                                 // global handler
                                                 this.emit(WorkflowEvents.Audit, action);
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
                        } // end parse JSON
                    } else {
                        this.emit(
                            WorkflowEvents.Error,
                            new TypeError(`Message ${message} is not valid JSON '{event, context}'`));
                    } // end if message
                } // end if channel message
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

    public reset(channel?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // TODO:
            // loop through workflows (by channel if set)
            // forEach
                // remove from db
                // remove from memory

            this.emit(WorkflowEvents.Reset);
            resolve();
        });
    }

    protected saveWorkflowsToDatabase(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            if (this.workflows) {
                const jobs: Array<Promise<string>> = [];

                this.workflows[channel].map((workflow: IWorkflow) => {
                    // build key
                    const nameHash: number = this.hash(workflow.getName());
                    const key: string = [channel, nameHash].join(":");

                    // queue job
                    jobs.push(this.saveWorkflowToDb(key, workflow));
                });

                // run jobs and add keys to workflows set
                Promise.all(jobs)
                    .then((workflowKeys) => {
                        const channelWorkflowId: string = [channel, this.REDIS_WORKFLOW_KEY_SUFFIX].join(":");
                        this.client.sadd(channelWorkflowId, ...workflowKeys, (err: Error, reply: number) => {
                            this.emit(WorkflowEvents.Save, channel);
                            resolve();
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }

    protected saveWorkflowToDb(key: string, workflow: IWorkflow): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!key || typeof key !== "string") {
                throw new TypeError("Key must be valid string");
            }
            if (!workflow || typeof workflow !== "object") {
                throw new TypeError("Workflow must be valid Workflow");
            }

            // serialize
            const workflowDict: Dictionary = workflow.toDict();

            this.client.set(key, JSON.stringify(workflowDict), (err: Error, reply: string) => {
                if (err !== null) {
                    throw err;
                }

                resolve(key);
            });
        });
    }

    protected getWorkflowFromDb(key: string): Promise<IWorkflow> {
        return new Promise((resolve, reject) => {
            if (!key || typeof key !== "string") {
                throw new TypeError("Key must be valid string");
            }

            this.client.get(key, (err: Error, reply: string) => {
                if (err !== null) {
                    throw err;
                }

                try {
                    const pFlow: Dictionary = JSON.parse(reply);
                    const pWorkflow: IWorkflow = new Workflow().fromDict(pFlow);

                    resolve(pWorkflow);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    protected loadWorkflowsFromDatabase(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            const jobs: Array<Promise<any>> = [];

            this.client.smembers(
                [channel, this.REDIS_WORKFLOW_KEY_SUFFIX].join(":"),
                (err: Error, flows: string[]) => {

                if (err !== null) {
                    throw err;
                }

                // loop through keys and get JSON workflow dict
                flows.map((key) => {
                    jobs.push(this.getWorkflowFromDb(key));
                }); // flows

                Promise.all(jobs)
                    .then((pWorkflows) => {
                        this.setWorkflowsForChannel(channel, pWorkflows);

                        this.emit(WorkflowEvents.Load);
                        resolve();
                    })
                    .catch((error) => {
                        throw error;
                    });
            }); // smembers
        });
    }

    protected removeWorkflowsFromDatabase(channel: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof channel !== "string") {
                throw new TypeError("Channel parameter must be a string");
            }

            const key: string = [channel, this.REDIS_WORKFLOW_KEY_SUFFIX].join(":");
            this.client.del(key, (err: Error, reply: number) => {
                this.emit(WorkflowEvents.Delete, channel);
                resolve();
            });
        });
    }

    /* tslint:disable */
    protected hash(str: string): number {
        let hash: number = 0;
        const strlen: number = str.length;

        if (strlen === 0) { return hash; }

        for (let i = 0; i < strlen; ++i) {
            const code: number = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + code;
            hash &= hash; // Int32
        }
        return (hash >>> 0); // uInt32
    }
    /* tslint:enable */
}
