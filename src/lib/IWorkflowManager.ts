import { EventEmitter } from "events";
import IWorkflow from "./IWorkflow";

export default interface IWorkflowManager extends EventEmitter {
    // in-memory methods
    setWorkflows(workflows: Dictionary): void;
    setWorkflowsForChannel(channel: string, workflows: IWorkflow[]): void;
    getWorkflows(): Dictionary;
    getWorkflowsForChannel(channel: string): IWorkflow[];

    // persistent methods
    addWorkflow(channel: string, workflow: IWorkflow): Promise<void>;
    removeWorkflow(channel: string, name: string): Promise<void>;
    start(channel: string): Promise<void>;
    stop(channel: string): Promise<void>;
    reload(channels: string[]): Promise<void>;
    save(channels: string[]): Promise<void>;
    reset(channel?: string): Promise<void>;
}
