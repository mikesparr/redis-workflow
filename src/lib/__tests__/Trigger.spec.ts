import ITrigger from "../ITrigger";
import Trigger from "../Trigger";

describe("Trigger", () => {
    let testTrigger: ITrigger;

    const testName: string = "test";

    it("instantiates a trigger object", () => {
        testTrigger = new Trigger(testName);
        expect(testTrigger).toBeInstanceOf(Trigger);
    });

    describe("getName", () => {
        it("returns name", () => {
            const result: string = testTrigger.getName();
            expect(result).toEqual(testName);
        });
    });

    describe("setName", () => {
        it("sets name", () => {
            const newName: string = "newTest";
            testTrigger.setName(newName);
            const check: string = testTrigger.getName();
            expect(check).toEqual(newName);
        });
    });
});
