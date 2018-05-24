export default interface IRule {
    getName(): string;
    setName(name: string): void;
    getExpression(): string;
    setExpression(expression: string): void;
}
