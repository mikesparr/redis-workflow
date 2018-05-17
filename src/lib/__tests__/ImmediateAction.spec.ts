import { Action, ActionType } from "../Action";
import IAction from "../IAction";
import ImmediateAction from "../ImmediateAction";

describe("Action", () => {
    let testAction: IAction;

    const testName: string = "test";
    const testContext: Dictionary = {foo: "bar", inStock: 3};

    it("instantiates an action object", () => {
        testAction = new ImmediateAction(testName);
        testAction.setContext(testContext);
        expect(testAction).toBeInstanceOf(ImmediateAction);
        expect(testAction.getName()).toEqual(testName);
        expect(testAction.getType()).toEqual(ActionType.Immediate);
        expect(testAction.getContext()).toEqual(testContext);
    });

    it("throws error if invalid input", () => {
        expect( () => { const broke: IAction = new ImmediateAction(null); } ).toThrow();
    });

    /**
     * Inherited
     */
    describe("getContext", () => {
        it("returns context object", () => {
            const result: Dictionary = testAction.getContext();
            expect(result).toEqual(testContext);
        });
    });

    describe("setContext", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setContext(null); } ).toThrow();
        });

        it("sets context object", () => {
            const newContext: Dictionary = {test: "success"};
            testAction.setContext(newContext);
            const check: Dictionary = testAction.getContext();
            expect(check).toEqual(newContext);
        });
    });

    describe("getName", () => {
        it("returns name", () => {
            const result: string = testAction.getName();
            expect(result).toEqual(testName);
        });
    });

    describe("setName", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setName(null); } ).toThrow();
        });

        it("sets name", () => {
            const newName: string = "newTest";
            testAction.setName(newName);
            const check: string = testAction.getName();
            expect(check).toEqual(newName);
        });
    });

    describe("getType", () => {
        it("returns type", () => {
            const result: ActionType = testAction.getType();
            expect(result).toEqual(ActionType.Immediate);
        });
    });

    describe("setType", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setType(null); } ).toThrow();
        });

        // we really shouldn't ever use this, considering removing
        it("sets type", () => {
            const fakeAction: IAction = new ImmediateAction("fake");
            fakeAction.setType(ActionType.Named);
            const check: ActionType = fakeAction.getType();
            expect(check).toEqual(ActionType.Named);
            expect(check).not.toEqual(ActionType.Immediate);
        });
    });
});
