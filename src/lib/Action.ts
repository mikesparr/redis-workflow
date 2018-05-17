import IAction from "./IAction";

export enum ActionType {
    Delayed,
    Immediate,
    Named,
}

export abstract class Action implements IAction {
    protected context: {[key: string]: any};
    protected name: string;
    protected type: ActionType;

    constructor(name: string, type: ActionType) {
        this.name = name;
        this.type = type;
    }

    public getContext(): {[key: string]: any} {
        return this.context;
    }

    public setContext(context: {[key: string]: any}) {
        this.context = context;
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
