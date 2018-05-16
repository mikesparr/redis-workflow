import IRule from "../IRule";
import Rule from "../Rule";

describe("Rule", () => {
    it("instantiates a workflow object", () => {
        const testRule: IRule = new Rule("test", null, null);
        expect(testRule).toBeInstanceOf(Rule);
    });
});
