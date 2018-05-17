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
    let testWorkflow: IWorkflow;

    const testName: string = "test";
    const testTriggerName: string = "test.trigger101";
    const testRuleName1: string = "Foo should equal bar";
    const testRuleName2: string = "Should be in stock";
    const testRuleExpression1: string = `foo == "bar"`;
    const testRuleExpression2: string = `inStock > 0`;
    const testActionName1: string = "shipProduct";
    const testActionName2: string = "adjustInventory";
    const testWorkflowName: string = "test.workflow1";

    const trigger: ITrigger = new Trigger("test.trigger101");
    const rule1: IRule = new Rule(testRuleName1, testRuleExpression1);
    const rule2: IRule = new Rule(testRuleName2, testRuleExpression2);
    const action1: IAction = new ImmediateAction(testActionName1);
    const action2: IAction = new ImmediateAction(testActionName2);

    it("instantiates a workflow object", () => {
        testWorkflow = new Workflow(testWorkflowName, trigger, [rule1, rule2], [action1, action2]);
        expect(testWorkflow).toBeInstanceOf(Workflow);
    });

    it("returns actions if conditions met", (done) => {
        // arrange
        const message: Dictionary = {
            context: {
                foo: "bar",
                inStock: 3,
            },
            event: testTriggerName,
        };

        // act
        testWorkflow.getActionsForContext(message.context)
            .then((result) => {
                // assert
                expect(result.length).toEqual(2); // action1, action2
                done();
            })
            .catch((error) => {
                done.fail(error);
            });
    });

    describe("getId", () => {
        it("returns id", () => {
            const result: string = testWorkflow.getId();
            expect(result).toBeNull(); // doesn't exist yet
        });
    });

    describe("setId", () => {
        it("sets id", () => {
            const newId: string = "newId";
            testWorkflow.setId(newId);
            const check: string = testWorkflow.getId();
            expect(check).toEqual(newId);
        });
    });

    describe("getName", () => {
        it("returns name", () => {
            const result: string = testWorkflow.getName();
            expect(result).toEqual(testWorkflowName);
        });
    });

    describe("setName", () => {
        it("sets name", () => {
            const newName: string = "newTest";
            testWorkflow.setName(newName);
            const check: string = testWorkflow.getName();
            expect(check).toEqual(newName);
        });
    });

    describe("getTrigger", () => {
        it("returns trigger", () => {
            const result: ITrigger = testWorkflow.getTrigger();
            expect(result).toEqual(trigger);
        });
    });

    describe("setTrigger", () => {
        it("sets trigger", () => {
            const newTrigger: ITrigger = new Trigger("fake");
            testWorkflow.setTrigger(newTrigger);
            const check: ITrigger = testWorkflow.getTrigger();
            expect(check).toEqual(newTrigger);
        });
    });

    describe("getRules", () => {
        it("returns rules", () => {
            const result: IRule[] = testWorkflow.getRules();
            expect(result).toEqual([rule1, rule2]);
        });
    });

    describe("setRules", () => {
        it("sets rules", () => {
            const newRule: IRule = new Rule("fake", testRuleExpression1);
            testWorkflow.setRules([newRule]);
            const check: IRule[] = testWorkflow.getRules();
            expect(check).toEqual([newRule]);
        });
    });

    describe("addRule", () => {
        it("adds rule to array", () => {
            const tempWorkflow: IWorkflow = new Workflow(
                testWorkflowName, trigger, [rule1], [action1, action2]);
            tempWorkflow.addRule(rule2);
            const check: IRule[] = tempWorkflow.getRules();
            expect(check.length).toEqual(2);
        });
    });

    describe("removeRule", () => {
        it("removes named rule from array", () => {
            const tempWorkflow: IWorkflow = new Workflow(
                testWorkflowName, trigger, [rule1, rule2], [action1, action2]);
            tempWorkflow.removeRule(testRuleName2);
            const check: IRule[] = tempWorkflow.getRules();
            expect(check.length).toEqual(1);
            expect(check[0].getName()).toEqual(testRuleName1);
        });
    });

    describe("getActions", () => {
        it("returns actions", () => {
            const result: IAction[] = testWorkflow.getActions();
            expect(result).toEqual([action1, action2]);
        });
    });

    describe("setActions", () => {
        it("sets actions", () => {
            const newAction: IAction = new ImmediateAction("fake");
            testWorkflow.setActions([newAction]);
            const check: IAction[] = testWorkflow.getActions();
            expect(check).toEqual([newAction]);
        });
    });
});
