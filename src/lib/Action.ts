import IAction from "./IAction";

export default class Action implements IAction {
    protected name: string;

    constructor(name: string) {
        // console.log(`Action '${name}' initiated`);
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }
}
