import { EventEmitter } from "events";
import IWorkflow from "./IWorkflow";

export default interface IWorkflowManager extends EventEmitter {
    setWorkflows(workflows: Dictionary): void;
    setWorkflowsForChannel(channel: string, workflows: IWorkflow[]): void;
    getWorkflows(): Dictionary;
    getWorkflowsForChannel(channel: string): IWorkflow[];
    addWorkflow(channel: string, workflow: IWorkflow): Promise<void>;
    removeWorkflow(channel: string, name: string): Promise<void>;
    start(channel: string): Promise<void>;
    stop(channel: string): Promise<void>;
}
