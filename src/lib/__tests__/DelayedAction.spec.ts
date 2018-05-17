import { Action, ActionType } from "../Action";
import DelayedAction from "../DelayedAction";
import IAction from "../IAction";

describe("DelayedAction", () => {
    it("instantiates a delayed action object", () => {
        const context: {[key: string]: any} = {foo: "bar", inStock: 3};
        const testAction: IAction = new DelayedAction("test", 1234567890);
        testAction.setContext(context);
        expect(testAction).toBeInstanceOf(DelayedAction);
    });
});
