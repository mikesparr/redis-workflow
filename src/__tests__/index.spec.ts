/// <reference path="../global.d.ts" />

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
    Util,
    Workflow,
    WorkflowEvents,
} from "../index";

describe("RedisWorkflowManager", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const manager: IWorkflowManager = new RedisWorkflowManager(config);

    const testKey: string = "test123";
    const testKey2: string = "test234";
    const testKey3: string = "test456";
    const testEmptyKey: string = "testEmptyKey999";
    const testKillMessage: string = "WFKILL"; // keep in sync with class

    const testEventName: string = "test_event_888";
    const testEventName2: string = "test_event_2";
    const testEvent: string = JSON.stringify( {event: testEventName, context: {age: 77}} );
    const testEvent2: string = JSON.stringify( {event: testEventName2, context: {age: 55}} );
    const testActionName: string = "test_action_999";
    const testActionName2: string = "test_action_000";
    const testRuleName: string = "Is retired";
    const testRuleName2: string = "Is a grandparent";
    const testRuleExpression: string = "age == 77";
    const testRuleExpression2: string = "age == 55";
    const testWorkflowName: string = "test_workflow_1";
    const testWorkflowName2: string = "test_workflow_2";

    const testTrigger1: ITrigger = new Trigger(testEventName); // immediate
    const testTrigger2: ITrigger = new Trigger(testEventName2); // delayed
    const testRule1: IRule = new Rule(testRuleName, testRuleExpression);
    const testRule2: IRule = new Rule(testRuleName, testRuleExpression2);
    const testAction1: IAction = new ImmediateAction(testActionName);
    const testAction2: IAction = new DelayedAction(testActionName).delay(1, "day").repeat(3);
    const testWorkflow1: IWorkflow = new Workflow(testWorkflowName, testTrigger1, [testRule1], [testAction1]);
    const testWorkflow2: IWorkflow = new Workflow(testWorkflowName2, testTrigger2, [testRule2], [testAction2]);

    const client: any = redis.createClient(); // for confirming app TODO: mock

    beforeAll((done) => {
        jest.setTimeout(5000); // 5 second timeout

        // add test workflows
        manager.setWorkflows({
            [testKey]: [testWorkflow1, testWorkflow2],
            [testKey2]: [testWorkflow1, testWorkflow2],
            [testKey3]: [testWorkflow1, testWorkflow2],
            [testEmptyKey]: [],
        });

        // add default workflow
        this.workflows = {};
        done();
    });

    afterAll((done) => {
        // TODO: remove workflow set for channels, and workflows
        done();
    });

    it("instantiates a WorkflowManager", () => {
        expect(manager).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    it("uses existing RedisClient if passed", () => {
        const workflowWithClient: IWorkflowManager = new RedisWorkflowManager(null, client);
        expect(workflowWithClient).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    it("loads workflows from database if channels provided", (done) => {
        // arrange
        const testDict: Dictionary = {
            actions: [
                {
                    name: testActionName,
                    type: ActionType.Immediate,
                },
            ],
            name: testWorkflowName,
            rules: [
                {
                    expression: testRuleExpression,
                    name: testRuleName,
                },
            ],
            trigger: {
                name: testEventName,
            },
        };

        // create key channel:hash (hash: number = hash(workflow.getName()))
        const channelWfHashKey: string = [testKey3, 2695549310].join(":");

        // store workflow key in set for channelName:workflows
        client.sadd([testKey3, "workflows"].join(":"), channelWfHashKey,
            (saddError: Error, saddReply: number) => {

            // save serialized workflow
            client.set(channelWfHashKey, JSON.stringify(testDict),
                (setError: Error, setReply: number) => {

                // instantiate manager with channel(s)
                const pManager: IWorkflowManager = new RedisWorkflowManager(config, null, [testKey3]);

                pManager.on(WorkflowEvents.Ready, () => {
                    const result: IWorkflow[] = pManager.getWorkflowsForChannel(testKey3);
                    expect(result).toBeDefined();
                    expect(result).toEqual([testWorkflow1]);
                    done();
                });

                pManager.on(WorkflowEvents.Error, (error) => {
                    done.fail(error);
                });
            });
        });
    }); // constructor

    describe("getWorkflows", () => {
        it("returns dictionary of workflows", (done) => {
            const result: Dictionary = manager.getWorkflows();

            // assert
            expect(result[testKey].length).toEqual(2);
            expect(result[testKey][0]).toBeInstanceOf(Workflow);
            expect(result[testKey2].length).toEqual(2);
            expect(result[testKey2][0]).toBeInstanceOf(Workflow);
            done();
        });
    }); // getWorkflows

    describe("setWorkflows", () => {
        it("replaces workflows with provided dictionary", (done) => {
            // act
            manager.setWorkflows({
                [testKey]: [testWorkflow1, testWorkflow2],
                [testKey2]: [testWorkflow1, testWorkflow2],
                [testEmptyKey]: [],
            });
            const result: Dictionary = manager.getWorkflows();

            // assert
            expect(result[testKey].length).toEqual(2);
            expect(result[testKey][0]).toBeInstanceOf(Workflow);
            done();
        });
    }); // getWorkflows

    describe("getWorkflowsForChannel", () => {
        it("returns array of workflows", (done) => {
            const result: IWorkflow[] = manager.getWorkflowsForChannel(testKey);

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(Workflow);
            done();
        });
    }); // getWorkflows

    describe("setWorkflowsForChannel", () => {
        it("replaces workflows with provided array", (done) => {
            // act
            manager.setWorkflowsForChannel(testKey, [testWorkflow1, testWorkflow2]);
            const result: IWorkflow[] = manager.getWorkflowsForChannel(testKey);

            // assert
            expect(result.length).toEqual(2);
            expect(result[0]).toBeInstanceOf(Workflow);
            done();
        });
    }); // getWorkflows

    describe("addWorkflow", () => {
        beforeAll((done) => {
            // arrange: (delete workflows for channel from db)
            client.del([testKey, "workflows"].join(":"), (err: Error, reply: string) => {
                if (err !== null) {
                    done.fail(err);
                }

                done();
            });
        });

        it("returns a Promise", () => {
            expect(manager.addWorkflow(testEmptyKey, testWorkflow1)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Add, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.addWorkflow(testEmptyKey, testWorkflow1);
        });

        it("adds a workflow to the array of workflows", (done) => {
            // act
            manager.addWorkflow(testKey, testWorkflow1)
                .then(() => {
                    const result: IWorkflow[] = manager.getWorkflowsForChannel(testKey);

                    // assert
                    expect(result.length).toEqual(3);
                    expect(result[1]).toBeInstanceOf(Workflow);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("saves updated workflows to database", (done) => {
            client.smembers([testKey, "workflows"].join(":"), (err: Error, reply: string[]) => {
                if (err !== null) {
                    done.fail(err);
                } else {
                    expect(reply).toBeDefined();
                    expect(reply.length).toBeGreaterThan(0);
                    done();
                }
            });
        });
    }); // addWorkflow

    describe("removeWorkflow", () => {
        it("returns a Promise", () => {
            expect(manager.removeWorkflow(testEmptyKey, testWorkflow1.getName())).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Remove, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.removeWorkflow(testEmptyKey, testWorkflow1.getName());
        });

        it("removes workflow from the array of workflows", (done) => {
            // act
            manager.removeWorkflow(testKey, testWorkflow1.getName())
                .then(() => {
                    const channelFlows: IWorkflow[] = manager.getWorkflowsForChannel(testKey);

                    // assert
                    channelFlows.filter((flow: IWorkflow) => flow.getName() === name);
                    expect(channelFlows.length).toEqual(1);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // removeWorkflow

    describe("start", () => {
        beforeAll((done) => {
            // replace workflows
            manager.setWorkflows({
                [testKey]: [testWorkflow1, testWorkflow2],
                [testKey2]: [testWorkflow1, testWorkflow2],
                [testKey3]: [testWorkflow1, testWorkflow2],
                [testEmptyKey]: [],
            });

            done();
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Start, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
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
                            }, 1000);
                        });
                    }, 500);
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
                            }, 1000);
                        });
                    }, 500);
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("starts a pubsub listener and emits immediate actions", (done) => {
            // arrange
            manager.on(WorkflowEvents.Immediate, (context) => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.start(testKey3)
                .then(() => {
                    setTimeout(() => {
                        client.publish(testKey3, testEvent, (pubErr: Error, _1: number) => {
                            // now kill it
                            setTimeout(() => {
                                client.publish(testKey3, testKillMessage, (killErr: Error, _2: number) => {
                                    // do nothing
                                });
                            }, 1000);
                        });
                    }, 500);
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

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.stop(testEmptyKey);
        });
    }); // stop

    describe("reload", () => {
        it("returns a Promise", () => {
            expect(manager.reload([testKey2])).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Ready, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.reload([testKey]);
        });

        // already tested db with constructor tests
    }); // reload

    describe("save", () => {
        it("returns a Promise", () => {
            expect(manager.save([testKey2])).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Save, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.save([testKey]);
        });

        // database tested in reset
    });

    describe("reset", () => {
        it("returns a Promise", () => {
            expect(manager.reset()).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Reset, () => {
                // assert
                done();
            });

            manager.on(WorkflowEvents.Error, (error) => {
                done.fail(error);
            });

            // act
            manager.reset();
        });

        it("removes workflow from memory", () => {
            expect(this.workflows).toEqual({});
        });

    }); // reset

}); // redis workflow
