import IRule from "./IRule";

export default class Rule implements IRule {
    protected name: string;

    constructor(name: string, expression: string, context?: any) {
        // console.log(`Rule '${name}' initiated`);
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }
}
