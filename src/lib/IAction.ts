import { ActionType } from "./Action";

export default interface IAction {
    getContext(): {[key: string]: any};
    setContext(context: {[key: string]: any}): void;
    getName(): string;
    setName(name: string): void;
    getType(): ActionType;
    setType(type: ActionType): void;
}
