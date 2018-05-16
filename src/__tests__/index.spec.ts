import { EventEmitter } from "events";
import * as redis from "redis";
import {
    ActionType,
    DelayedAction,
    IAction,
    ImmediateAction,
    IRule,
    ITrigger,
    IWorkflow,
    IWorkflowManager,
    RedisConfig,
    RedisWorkflowManager,
    Rule,
    Trigger,
    Workflow,
    WorkflowEvents,
} from "../index";

describe("RedisWorkflow", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const manager: IWorkflowManager = new RedisWorkflowManager(config);

    const testKey: string = "test123";
    const testKey2: string = "test234";
    const testEmptyKey: string = "testEmptyKey999";
    const testKillMessage: string = "WFKILL"; // keep in sync with class

    const testEventName: string = "test_event_888";
    const testEventName2: string = "test_event_2";
    const testEvent: string = JSON.stringify( {event: testEventName, context: {age: 77}} );
    const testEvent2: string = JSON.stringify( {event: testEventName2, context: {age: 55}} );
    const testActionName: string = "test_action_999";
    const testRuleName: string = "It is valid";
    const testRuleExpression: string = "age == 77";
    const testRuleExpression2: string = "age == 55";
    const testWorkflowName: string = "test_workflow_1";
    const testWorkflowName2: string = "test_workflow_2";

    const testTrigger1: ITrigger = new Trigger(testEventName); // immediate
    const testTrigger2: ITrigger = new Trigger(testEventName2); // delayed
    const testRule1: IRule = new Rule(testRuleName, testRuleExpression);
    const testRule2: IRule = new Rule(testRuleName, testRuleExpression2);
    const testAction1: IAction = new ImmediateAction(testActionName);
    const testAction2: IAction = new DelayedAction(testActionName, null);
    const testWorkflow1: IWorkflow = new Workflow(testWorkflowName, testTrigger1, [testRule1], [testAction1]);
    const testWorkflow2: IWorkflow = new Workflow(testWorkflowName2, testTrigger2, [testRule2], [testAction2]);

    const client: any = redis.createClient(); // for confirming app TODO: mock

    it("instantiates a Workflow", () => {
        expect(manager).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    it("uses existing RedisClient if passed", () => {
        const workflowWithClient: IWorkflowManager = new RedisWorkflowManager(null, client);
        expect(workflowWithClient).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    beforeAll((done) => {
        jest.setTimeout(10000); // 10 second timeout

        // add test workflow
        manager.setWorkflows([testWorkflow1, testWorkflow2]);
        done();
    });

    afterAll((done) => {
        done();
    });

    describe("getWorkflows", () => {
        it("returns array of workflows", (done) => {
            const result: IWorkflow[] = manager.getWorkflows();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(Workflow);
            done();
        });
    }); // getWorkflows

    describe("setWorkflows", () => {
        it("replaces workflows with provided array", () => {
            // act
            manager.setWorkflows([testWorkflow1, testWorkflow2]);
            const result: IWorkflow[] = manager.getWorkflows();

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(Workflow);
        });
    }); // getWorkflows

    describe("addWorkflow", () => {
        it("returns a Promise", () => {
            expect(manager.addWorkflow(testEmptyKey, testWorkflow1)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Add, () => {
                // assert
                done();
            });

            // act
            manager.addWorkflow(testEmptyKey, testWorkflow1);
        });

        it("adds a workflow to the array of workflows", (done) => {
            // act
            manager.addWorkflow(testKey, testWorkflow1)
                .then(() => {
                    const result: IWorkflow[] = manager.getWorkflows(); // TODO: consider channel designation

                    // assert
                    expect(result.length).toBeGreaterThan(3);
                    expect(result[1]).toBeInstanceOf(Workflow);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // addWorkflow

    describe("start", () => {
        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Start, () => {
                // assert
                done();
            });

            // act
            manager.start(testEmptyKey);
        });

        it("starts a pubsub listener and applies workflows to messages", (done) => {
            // arrange
            manager.on(testActionName, (context) => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.start(testKey)
                .then(() => {
                    setTimeout(() => {
                        client.publish(testKey, testEvent, (pubErr: Error, _1: number) => {
                            // now kill it
                            setTimeout(() => {
                                client.publish(testKey, testKillMessage, (killErr: Error, _2: number) => {
                                    // do nothing
                                });
                            }, 3000);
                        });
                    }, 1000);
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("starts a pubsub listener and emits delayed actions", (done) => {
            // arrange
            manager.on(WorkflowEvents.Schedule, (action) => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.start(testKey2)
                .then(() => {
                    setTimeout(() => {
                        client.publish(testKey2, testEvent2, (pubErr: Error, _1: number) => {
                            // now kill it
                            setTimeout(() => {
                                client.publish(testKey2, testKillMessage, (killErr: Error, _2: number) => {
                                    // do nothing
                                });
                            }, 3000);
                        });
                    }, 1000);
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

    }); // start

    describe("stop", () => {
        it("returns a Promise", () => {
            expect(manager.stop(testEmptyKey)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Stop, () => {
                // assert
                done();
            });

            // act
            manager.stop(testEmptyKey);
        });
    }); // stop

}); // redis workflow
