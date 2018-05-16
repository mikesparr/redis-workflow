import {EventEmitter} from "events";
import IAction from "./Action";
import IWorkflow from "./IWorkflow";
import Rule from "./Rule";
import Trigger from "./Trigger";

export default interface IWorkflowManager extends EventEmitter {
    setWorkflows(workflows: IWorkflow[]): void;
    getWorkflows(): IWorkflow[];
    addWorkflow(channel: string, workflow: IWorkflow): Promise<void>;
    run(channel: string): Promise<void>;
    stop(channel: string): Promise<void>;
}
