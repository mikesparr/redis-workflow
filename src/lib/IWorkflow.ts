import {EventEmitter} from "events";
import Action from "./Action";
import Rule from "./Rule";
import Trigger from "./Trigger";

export default interface IWorkflow extends EventEmitter {
    add(channel: string, name: string, trigger: Trigger, rules: [Rule], actions: [Action]): Promise<void>;
    remove(channel: string): Promise<void>;
    load(channel: string): Promise<void>;
    run(channel: string): void;
    stop(channel: string): Promise<void>;
}
