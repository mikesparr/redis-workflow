import Action from "../Action";
import IAction from "../IAction";

describe("Action", () => {
    it("instantiates a workflow object", () => {
        const testAction: IAction = new Action("test");
        expect(testAction).toBeInstanceOf(Action);
    });
});
