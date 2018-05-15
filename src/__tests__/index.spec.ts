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
        it("returns a Promise", () => {
            expect(myWorkflow.run(testEmptyKey)).toBeInstanceOf(Promise);
        });

        it("emits an EventEmitter event", (done) => {
            // arrange
            myWorkflow.on(WorkflowEvents.Run, () => {
                // assert
                done();
            });

            // act
            myWorkflow.run(testEmptyKey);
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
