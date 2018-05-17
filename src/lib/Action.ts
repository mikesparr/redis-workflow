import IAction from "./IAction";

export enum ActionType {
    Delayed,
    Immediate,
    Named,
}

export abstract class Action implements IAction {
    protected context: Dictionary;
    protected name: string;
    protected type: ActionType;

    constructor(name: string, type: ActionType) {
        if (!name || typeof name !== "string") {
            throw new TypeError("Name must be a valid string");
        }

        this.name = name;
        this.type = type;
        return this;
    }

    public getContext(): Dictionary {
        return this.context;
    }

    public setContext(obj: Dictionary): IAction {
        if (!obj || typeof obj !== "object") {
            throw new TypeError("Context must be a valid object");
        }

        this.context = obj;
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): IAction {
        if (!name || typeof name !== "string") {
            throw new TypeError("Name must be a valid string");
        }

        this.name = name;
        return this;
    }

    public getType(): ActionType {
        return this.type;
    }

    public setType(type: ActionType): IAction {
        if (!type || typeof type !== "number") {
            throw new TypeError("Type must be a valid ActionType");
        }

        this.type = type;
        return this;
    }
}
