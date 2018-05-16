import { EventEmitter } from "events";
import IWorkflow from "./IWorkflow";

export default interface IWorkflowManager extends EventEmitter {
    setWorkflows(workflows: IWorkflow[]): void;
    getWorkflows(): IWorkflow[];
    addWorkflow(channel: string, workflow: IWorkflow): Promise<void>;
    run(channel: string): Promise<void>;
    stop(channel: string): Promise<void>;
}
