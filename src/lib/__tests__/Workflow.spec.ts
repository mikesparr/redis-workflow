import { Action, ActionType } from "../Action";
import DelayedAction from "../DelayedAction";
import IAction from "../IAction";
import ImmediateAction from "../ImmediateAction";
import IRule from "../IRule";
import ITrigger from "../ITrigger";
import IWorkflow from "../IWorkflow";
import Rule from "../Rule";
import Trigger from "../Trigger";
import Workflow from "../Workflow";

describe("Workflow", () => {
    it("instantiates a workflow object", () => {
        const testWorkflow: IWorkflow = new Workflow("test", null, null, null);
        expect(testWorkflow).toBeInstanceOf(Workflow);
    });

    it("returns actions if conditions met", (done) => {
        // arrange
        const trigger: ITrigger = new Trigger("test.trigger101");
        const rule1: IRule = new Rule("Foo should equal bar", `foo == "bar"`);
        const rule2: IRule = new Rule("Should be in stock", "inStock > 0");
        const action1: IAction = new ImmediateAction("shipProduct");
        const action2: IAction = new ImmediateAction("adjustInventory");
        const workflow: IWorkflow = new Workflow("test.workflow1", trigger, [rule1, rule2], [action1, action2]);

        const message: {[key: string]: any} = {
            context: {
                foo: "bar",
                inStock: 3,
            },
            event: "test.trigger101",
        };

        // act
        workflow.getActionsForContext(message.context)
            .then((result) => {
                // assert
                expect(result.length).toEqual(2); // action1, action2
                done();
            })
            .catch((error) => {
                done.fail(error);
            });
    });
});
