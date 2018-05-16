import { Action, ActionType } from "../Action";
import DelayedAction from "../DelayedAction";
import IAction from "../IAction";

describe("DelayedAction", () => {
    it("instantiates a delayed action object", () => {
        const context: {[key: string]: any} = {foo: "bar", inStock: 3};
        const testAction: IAction = new DelayedAction("test", context, 1234567890, null, null);
        expect(testAction).toBeInstanceOf(DelayedAction);
    });
});
