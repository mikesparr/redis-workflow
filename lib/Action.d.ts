import IAction from "./IAction";
export declare enum ActionType {
    Delayed = 0,
    Immediate = 1,
    Named = 2,
}
export declare abstract class Action implements IAction {
    protected context: Dictionary;
    protected name: string;
    protected type: ActionType;
    constructor(name: string, type: ActionType);
    getContext(): Dictionary;
    setContext(obj: Dictionary): IAction;
    getName(): string;
    setName(name: string): IAction;
    getType(): ActionType;
    setType(type: ActionType): IAction;
}
