import { Action, ActionType } from "../Action";
import IAction from "../IAction";

describe("Action", () => {
    it("instantiates an action object", () => {
        const testAction: IAction = new Action("test", ActionType.Immediate);
        expect(testAction).toBeInstanceOf(Action);
    });
});
