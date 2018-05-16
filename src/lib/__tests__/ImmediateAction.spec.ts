import { Action, ActionType } from "../Action";
import IAction from "../IAction";
import ImmediateAction from "../ImmediateAction";

describe("Action", () => {
    it("instantiates an action object", () => {
        const testAction: IAction = new ImmediateAction("test");
        expect(testAction).toBeInstanceOf(Action);
    });
});
