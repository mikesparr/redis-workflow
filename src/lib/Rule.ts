import IRule from "./IRule";

export default class Rule implements IRule {
    protected name: string;
    protected expression: string;

    constructor(name: string, expression: string) {
        this.name = name;
        this.expression = expression;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getExpression(): string {
        return this.expression;
    }

    public setExpression(expression: string): void {
        this.expression = expression;
    }
}
