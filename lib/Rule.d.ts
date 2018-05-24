import IRule from "./IRule";
export default class Rule implements IRule {
    protected name: string;
    protected expression: string;
    constructor(name: string, expression: string);
    getName(): string;
    setName(name: string): void;
    getExpression(): string;
    setExpression(expression: string): void;
}
