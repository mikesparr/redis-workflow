import IAction from "./IAction";

export enum ActionType {
    Immediate,
    Delayed,
}

export abstract class Action implements IAction {
    protected name: string;
    protected type: ActionType;

    constructor(name: string, type: ActionType) {
        this.name = name;
        this.type = type;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getType(): ActionType {
        return this.type;
    }

    public setType(type: ActionType): void {
        this.type = type;
    }
}
