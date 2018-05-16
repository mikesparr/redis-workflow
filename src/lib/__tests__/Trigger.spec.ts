import ITrigger from "../ITrigger";
import Trigger from "../Trigger";

describe("Trigger", () => {
    it("instantiates a trigger object", () => {
        const testTrigger: ITrigger = new Trigger("test");
        expect(testTrigger).toBeInstanceOf(Trigger);
    });
});
