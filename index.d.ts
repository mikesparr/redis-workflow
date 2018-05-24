/// <reference types="node" />
import { EventEmitter } from "events";
import * as redis from "redis";
import { ActionType } from "./lib/Action";
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
import Util from "./lib/Util";
import Workflow from "./lib/Workflow";
export { ActionType, DelayedAction, IAction, ImmediateAction, IRule, ITrigger, IWorkflow, IWorkflowManager, RedisConfig, Rule, Trigger, Util, Workflow };
export declare enum WorkflowEvents {
    Error = "error",
    Add = "add",
    Remove = "remove",
    Load = "load",
    Save = "save",
    Delete = "delete",
    Ready = "ready",
    Start = "start",
    Stop = "stop",
    Reset = "reset",
    Schedule = "schedule",
    Immediate = "immediate",
    Invalid = "invalid",
    Audit = "audit",
    Kill = "kill",
}
export declare class RedisWorkflowManager extends EventEmitter implements IWorkflowManager {
    protected client: redis.RedisClient;
    protected subscriber: redis.RedisClient;
    protected workflows: Dictionary;
    protected readonly DEFAULT_REDIS_HOST: string;
    protected readonly DEFAULT_REDIS_PORT: number;
    protected readonly PUBSUB_KILL_MESSAGE: string;
    protected readonly REDIS_WORKFLOW_KEY_SUFFIX: string;
    constructor(config: RedisConfig, client?: redis.RedisClient, channels?: string[]);
    setWorkflows(workflows: Dictionary): void;
    setWorkflowsForChannel(channel: string, workflows: IWorkflow[]): void;
    getWorkflows(): Dictionary;
    getWorkflowsForChannel(channel: string): IWorkflow[];
    addWorkflow(channel: string, workflow: IWorkflow): Promise<void>;
    removeWorkflow(channel: string, name: string): Promise<void>;
    start(channel: string): Promise<void>;
    stop(channel: string): Promise<void>;
    reload(channels: string[]): Promise<void>;
    save(channels: string[]): Promise<void>;
    reset(channel?: string): Promise<void>;
    protected saveWorkflowsToDatabaseForChannel(channel: string): Promise<void>;
    protected saveWorkflowToDatabase(key: string, workflow: IWorkflow): Promise<string>;
    protected getWorkflowFromDb(key: string): Promise<IWorkflow>;
    protected loadWorkflowsFromDatabaseForChannel(channel: string): Promise<void>;
    protected removeWorkflowsFromDatabase(channel: string): Promise<void>;
    protected getTriggersAsDictForChannel(channel: string): Dictionary;
}
