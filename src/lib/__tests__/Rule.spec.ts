import IRule from "../IRule";
import Rule from "../Rule";

describe("Rule", () => {
    let testRule: IRule;

    const testName: string = "test";
    const testExpression: string = `foo == "bar"`;

    it("instantiates a rule object", () => {
        testRule = new Rule(testName, testExpression);
        expect(testRule).toBeInstanceOf(Rule);
    });

    describe("getName", () => {
        it("returns name", () => {
            const result: string = testRule.getName();
            expect(result).toEqual(testName);
        });
    });

    describe("setName", () => {
        it("sets name", () => {
            const newName: string = "newTest";
            testRule.setName(newName);
            const check: string = testRule.getName();
            expect(check).toEqual(newName);
        });
    });

    describe("getExpression", () => {
        it("returns expression", () => {
            const result: string = testRule.getExpression();
            expect(result).toEqual(testExpression);
        });
    });

    describe("setExpression", () => {
        it("sets expression", () => {
            const newExpression: string = `foo !== "bar"`;
            testRule.setExpression(newExpression);
            const check: string = testRule.getExpression();
            expect(check).toEqual(newExpression);
        });
    });
});
