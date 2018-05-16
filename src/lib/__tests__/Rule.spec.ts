import IRule from "../IRule";
import Rule from "../Rule";

describe("Rule", () => {
    it("instantiates a rule object", () => {
        const testRule: IRule = new Rule("test", null);
        expect(testRule).toBeInstanceOf(Rule);
    });
});
