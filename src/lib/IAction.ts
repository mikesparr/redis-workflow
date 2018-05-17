import { ActionType } from "./Action";

export default interface IAction {
    getContext(): Dictionary;
    setContext(context: Dictionary): void;
    getName(): string;
    setName(name: string): void;
    getType(): ActionType;
    setType(type: ActionType): void;
}
