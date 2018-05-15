import { EventEmitter } from "events";
import * as redis from "redis";
import { IWorkflow, RedisConfig, RedisWorkflow, WorkflowEvents } from "../index";

describe("RedisWorkflow", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const myWorkflow: IWorkflow = new RedisWorkflow(config);
    const testKey: string = "test123";
    const testEvent: string = "test_event_888";
    const testKillMessage: string = "WFKILL"; // keep in sync with class
    const testEmptyKey: string = "testEmptyKey999";
    const testName: string = "testWorkflow1";

    const client: any = redis.createClient(); // for confirming app TODO: mock

    it("instantiates a Workflow", () => {
        expect(myWorkflow).toBeInstanceOf(RedisWorkflow);
    }); // constructor

    it("uses existing RedisClient if passed", () => {
        const workflowWithClient: IWorkflow = new RedisWorkflow(null, client);
        expect(workflowWithClient).toBeInstanceOf(RedisWorkflow);
    }); // constructor

    beforeAll((done) => {
        done();
    });

    afterAll((done) => {
        done();
    });

    describe("add", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.add(testEmptyKey, testName, null, null, null)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Add, () => {
                // assert
                done();
            });

            // act
            myWorkflow.add(testEmptyKey, testName, null, null, null);
        });
    }); // add

    describe("remove", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.remove(testEmptyKey)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Remove, () => {
                // assert
                done();
            });

            // act
            myWorkflow.remove(testEmptyKey);
        });

    }); // remove

    describe("load", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.load(testEmptyKey)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Load, () => {
                // assert
                done();
            });

            // act
            myWorkflow.load(testEmptyKey);
        });

    }); // load

    describe("run", () => {
        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Run, () => {
                // assert
                console.log(`Run was called`);
                done();
            });

            // act
            myWorkflow.run(testEmptyKey);
        });

        it("starts a pubsub listener and applies workflows to messages", (done) => {
            // arrange
            myWorkflow.on(testEvent, () => {
                console.log(`Test event fired!!!`);
                done();
            });

            // act
            myWorkflow.run(testKey);

            setTimeout(() => {
                client.publish(testKey, testEvent, (pubErr: Error, reply: number) => {
                    console.log(`Published ${testEvent} to pubsub`);
    
                    // now kill it
                    client.publish(testKey, testKillMessage, (killErr: Error, reply: number) => {
                        console.log(`Published kill message`);
                    });
                });
            }, 3000);
        });

    }); // run

    describe("stop", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.stop(testEmptyKey)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Stop, () => {
                // assert
                done();
            });

            // act
            myWorkflow.stop(testEmptyKey);
        });

    }); // stop

}); // redis workflow
