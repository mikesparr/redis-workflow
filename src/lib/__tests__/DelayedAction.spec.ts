/// <reference path="../../global.d.ts" />

import { Action, ActionType } from "../Action";
import DelayedAction from "../DelayedAction";
import IAction from "../IAction";

describe("DelayedAction", () => {
    let testAction: DelayedAction;

    const startDate: Date = new Date("2000-01-01");
    const startTimestamp: number = startDate.valueOf() / 1000;

    const testName: string = "test";
    const testContext: Dictionary = {foo: "bar", inStock: 3};

    it("instantiates a delayed action object", () => {
        testAction = new DelayedAction(testName).delay(1, "day");
        testAction.setContext(testContext);
        expect(testAction).toBeInstanceOf(DelayedAction);
    });

    it("throws error if invalid name", () => {
        expect( () => { const broke: IAction = new DelayedAction(null); } ).toThrow();
    });

    /**
     * Inherited
     */
    describe("getContext", () => {
        it("returns context object", () => {
            const result: Dictionary = testAction.getContext();
            expect(result).toEqual(testContext);
        });
    });

    describe("setContext", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setContext(null); } ).toThrow();
        });

        it("sets context object", () => {
            const newContext: Dictionary = {test: "success"};
            testAction.setContext(newContext);
            const check: Dictionary = testAction.getContext();
            expect(check).toEqual(newContext);
        });
    });

    describe("getName", () => {
        it("returns name", () => {
            const result: string = testAction.getName();
            expect(result).toEqual(testName);
        });
    });

    describe("setName", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setName(null); } ).toThrow();
        });

        it("sets name", () => {
            const newName: string = "newTest";
            testAction.setName(newName);
            const check: string = testAction.getName();
            expect(check).toEqual(newName);
        });
    });

    describe("getType", () => {
        it("returns type", () => {
            const result: ActionType = testAction.getType();
            expect(result).toEqual(ActionType.Delayed);
        });
    });

    describe("setType", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setType(null); } ).toThrow();
        });

        // we really shouldn't ever use this, considering removing
        it("sets type", () => {
            const fakeAction: IAction = new DelayedAction("fake");
            fakeAction.setType(ActionType.Named);
            const check: ActionType = fakeAction.getType();
            expect(check).toEqual(ActionType.Named);
            expect(check).not.toEqual(ActionType.Delayed);
        });
    });

    /**
     * Class member
     */
    describe("getScheduledDateAsTimestamp", () => {
        it("returns timestamp of next scheduled date", () => {
            const now: number = Date.now() / 1000;
            const result: number = testAction.getScheduledDateAsTimestamp();
            expect(result).toBeGreaterThanOrEqual(now);
        });
    });

    describe("setScheduledDate", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setScheduledDate(null); } ).toThrow();
        });

        it("sets scheduled date", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "hour");
            const now: number = Date.now() / 1000;

            delayedAction.setScheduledDate(now);
            const check: number = delayedAction.getScheduledDateAsTimestamp();

            expect(check).toEqual(now);
        });

        it("returns its own instance for chained calls", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day");
            const result: DelayedAction = delayedAction.setScheduledDate(170000000);
            expect(result).toBeInstanceOf(DelayedAction);
        });
    });

    describe("setInterval", () => {
        it("throws error for invalid input", () => {
            expect( () => { testAction.setInterval(null); } ).toThrow();
        });

        it("sets interval", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "hour");
            const testInterval: number = 1000 * 60 * 60 * 24; // 1 day

            delayedAction.setInterval(testInterval);
            const check: number = delayedAction.getIntervalAsMilliseconds();

            expect(check).toEqual(testInterval);
        });

        it("returns its own instance for chained calls", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day");
            const result: DelayedAction = delayedAction.setInterval(1000);
            expect(result).toBeInstanceOf(DelayedAction);
        });
    });

    describe("getIntervalAsMilliseconds", () => {
        it("returns interval of 1 day (since delay was 1, 'day' upon creation)", () => {
            const testInterval: number = 1000 * 60 * 60 * 24;
            const result: number = testAction.getIntervalAsMilliseconds();
            expect(result).toEqual(testInterval);
        });
    });

    describe("isRepeat", () => {
        it("returns true if repeated", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "hour").repeat();
            const check: boolean = delayedAction.isRepeat();
            expect(check).toEqual(true);
        });

        it("returns false if repeated only once", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "hour").repeat(1); // only 1 time
            const check: boolean = delayedAction.isRepeat();
            expect(check).toEqual(false);
        });
    });

    describe("delay", () => {
        it("throws error for invalid amount", () => {
            expect( () => { testAction.delay(null, "week"); } ).toThrow();
        });

        it("throws error for invalid interval", () => {
            expect( () => { testAction.delay(1, null); } ).toThrow();
        });

        it("sets interval in seconds", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "second");
            const testInterval: number = 1000;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in minutes", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "minute");
            const testInterval: number = 1000 * 60;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in hours", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "hour");
            const testInterval: number = 1000 * 60 * 60;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in days", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day");
            const testInterval: number = 1000 * 60 * 60 * 24;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets default interval in days", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "fake");
            const testInterval: number = 1000 * 60 * 60 * 24;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in weeks", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "week");
            const testInterval: number = 1000 * 60 * 60 * 24 * 7;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in months", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "month");
            const testInterval: number = 1000 * 60 * 60 * 24 * 30;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("sets interval in years", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "year");
            const testInterval: number = 1000 * 60 * 60 * 24 * 365;
            const check: number = delayedAction.getIntervalAsMilliseconds();
            expect(check).toEqual(testInterval);
        });

        it("returns its own instance for chained calls", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake");
            const result: DelayedAction = delayedAction.delay(1, "day");
            expect(result).toBeInstanceOf(DelayedAction);
        });
    });

    describe("repeat", () => {
        it("sets infinite number of recurrances", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day").repeat();
            const check: number = delayedAction.getRecurrences();
            expect(check).toEqual(0);
        });

        it("sets defined number of recurrances", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day").repeat(5);
            const check: number = delayedAction.getRecurrences();
            expect(check).toEqual(5);
        });

        it("returns its own instance for chained calls", () => {
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day");
            const result: DelayedAction = delayedAction.repeat();
            expect(result).toBeInstanceOf(DelayedAction);
        });
    });

    describe("setScheduledDateFrom", () => {
        it("adds interval amount to start date", () => {
            // arrange
            const delayedAction: DelayedAction = new DelayedAction("fake").delay(1, "day"); // 1 day interval
            const testDate: Date = new Date();
            testDate.setDate(testDate.getDate() + 7); // a week from now
            const oneDay: number = 1000 * 60 * 60 * 24;
            const expected: number = testDate.getTime() + oneDay;

            // act
            delayedAction.setScheduledDateFrom(testDate.valueOf());

            // assert
            const check: number = delayedAction.getScheduledDateAsTimestamp();
            expect(check).toEqual( Math.floor(expected / 1000) );
        });
    });

});
