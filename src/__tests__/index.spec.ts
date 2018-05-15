import * as redis from "redis";
import {IWorkflow, RedisConfig, RedisWorkflow} from "../index";

describe("RedisWorkflow", () => {
    const config: RedisConfig = new RedisConfig(
        "localhost",
        6379,
        null,
        null,
    );
    const myWorkflow: IWorkflow<string> = new RedisWorkflow(config);
    const testKey: string = "test123";
    const testEmptyKey: string = "testEmptyKey999";

    const client: any = redis.createClient(); // for confirming app TODO: mock

    it("instantiates a Workflow", () => {
        expect(myWorkflow).toBeInstanceOf(RedisWorkflow);
    }); // constructor

    it("uses existing RedisClient if passed", () => {
        const workflowWithClient: IWorkflow<string> = new RedisWorkflow(null, client);
        expect(workflowWithClient).toBeInstanceOf(RedisWorkflow);
    }); // constructor

    beforeAll((done) => {
        done();
    });

    afterAll((done) => {
        done();
    });

    describe("length", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.length(testKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myWorkflow.length(null)
                .then((result) => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns number of elements in active Workflow", (done) => {
            myWorkflow.length(testKey)
                .then((result) => {
                    expect(result).toEqual(0); // TODO: edit once add test data
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("returns 0 if no elements or inactive Workflow", (done) => {
            myWorkflow.length(testEmptyKey)
                .then((result) => {
                    expect(result).toEqual(0);
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // length

    describe("isEmpty", () => {
        it("returns a Promise", () => {
            expect(myWorkflow.isEmpty(testKey)).toBeInstanceOf(Promise);
        });

        it("throws error if channel not valid", (done) => {
            myWorkflow.isEmpty(null)
                .then((result) => {
                    done.fail();
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(TypeError);
                    done();
                });
        });

        it("returns true if no elements are in Workflow", (done) => {
            myWorkflow.isEmpty(testEmptyKey)
                .then((result) => {
                    expect(result).toBeTruthy();
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });

        it("returns false if elements are in Workflow", (done) => {
            myWorkflow.isEmpty(testKey)
                .then((result) => {
                    //expect(result).toBeFalsy(); TODO: replace once test data exists
                    done();
                })
                .catch((error) => {
                    done.fail(error);
                });
        });
    }); // isEmpty



}); // redis workflow
