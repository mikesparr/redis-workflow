import ITrigger from "../ITrigger";
import Trigger from "../Trigger";

describe("Trigger", () => {
    it("instantiates a workflow object", () => {
        const testTrigger: ITrigger = new Trigger("test");
        expect(testTrigger).toBeInstanceOf(Trigger);
    });
});
