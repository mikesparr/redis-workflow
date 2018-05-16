import { EventEmitter } from "events";
import * as redis from "redis";
import { IWorkflow, IWorkflowManager, RedisConfig, RedisWorkflowManager, Workflow, WorkflowEvents } from "../index";

describe("RedisWorkflow", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const manager: IWorkflowManager = new RedisWorkflowManager(config);
    const testKey: string = "test123";
    const testEvent: string = "test_event_888";
    const testKillMessage: string = "WFKILL"; // keep in sync with class
    const testEmptyKey: string = "testEmptyKey999";
    const testName: string = "testWorkflow1";

    const client: any = redis.createClient(); // for confirming app TODO: mock

    it("instantiates a Workflow", () => {
        expect(manager).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    it("uses existing RedisClient if passed", () => {
        const workflowWithClient: IWorkflowManager = new RedisWorkflowManager(null, client);
        expect(workflowWithClient).toBeInstanceOf(RedisWorkflowManager);
    }); // constructor

    beforeAll((done) => {
        done();
    });

    afterAll((done) => {
        done();
    });

    describe("getWorkflows", () => {
        it("returns array of workflows", (done) => {
            // arrange
            const testWf: IWorkflow = new Workflow("test", null, null, null);

            // act
            manager.addWorkflow(testKey, testWf)
                .then(() => {
                    const result: IWorkflow[] = manager.getWorkflows();

                    // assert
                    expect(result.length).toEqual(1);
                    expect(result[0]).toBeInstanceOf(Workflow);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // getWorkflows

    describe("setWorkflows", () => {
        it("replaces workflows with provided array", () => {
            // arrange
            const testWf: IWorkflow = new Workflow("test", null, null, null);

            // act
            manager.setWorkflows([testWf]);
            const result: IWorkflow[] = manager.getWorkflows();

            // assert
            expect(result.length).toEqual(1);
            expect(result[0]).toBeInstanceOf(Workflow);
        });
    }); // getWorkflows

    describe("addWorkflow", () => {
        it("returns a Promise", () => {
            expect(manager.addWorkflow(testEmptyKey, null)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Add, () => {
                // assert
                done();
            });

            // act
            manager.addWorkflow(testEmptyKey, null);
        });
    }); // addWorkflow

    describe("run", () => {
        it("emits an EventEmitter event", (done) => {
            // arrange
            manager.on(WorkflowEvents.Run, () => {
                // assert
                done();
            });

            // act
            manager.run(testEmptyKey);
        });

        it("starts a pubsub listener and applies workflows to messages", (done) => {
            // arrange
            manager.on(testEvent, () => {
                // assert
                done();
            });

            // act
            manager.run(testKey)
                .then(() => {
                    setTimeout(() => {
                        client.publish(testKey, testEvent, (pubErr: Error, _1: number) => {
                            // now kill it
                            client.publish(testKey, testKillMessage, (killErr: Error, _2: number) => {
                                // do nothing
                            });
                        });
                    }, 2000);
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

    }); // run

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
