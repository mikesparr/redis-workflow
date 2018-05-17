import { Action, ActionType } from "./Action";
import IAction from "./IAction";

export default class DelayedAction extends Action {
    protected scheduledAt: number; // timestamp
    protected recurrences: number;
    protected interval: number;

    constructor(name: string,
                intervalAsMillis?: number,
                context?: {[key: string]: any},
                delayAsTimestamp?: number,
                repeat?: boolean) {

        if (!name || typeof name !== "string") {
            throw new TypeError("Name must be a valid string");
        }
        if (intervalAsMillis && typeof intervalAsMillis !== "number") {
            throw new TypeError("Interval must be a valid number");
        }
        if (context && typeof context !== "object") {
            throw new TypeError("Context must be a valid object");
        }
        if (delayAsTimestamp && typeof delayAsTimestamp !== "number") {
            throw new TypeError("Delay must be a valid number"); // TODO: consider validating timestamp
        }
        if (repeat && typeof repeat !== "boolean") {
            throw new TypeError("Repeat flag must be boolean true or false");
        }

        super(
            name,
            ActionType.Delayed,
        );

        this.recurrences = repeat ? 0 : 1; // 0 indefinitely
        this.interval = intervalAsMillis ? intervalAsMillis : 0;

        if (delayAsTimestamp) {
            this.scheduledAt = delayAsTimestamp;
        }

        return this;
    }

    public getScheduledDateAsTimestamp(): number {
        return this.scheduledAt || this.calcDelayAsTimestamp();
    }

    public setScheduledDate(timestamp: number): DelayedAction {
        if (!timestamp || typeof timestamp !== "number") {
            throw new TypeError("Timestamp must be a valid number");
        }

        this.scheduledAt = timestamp;
        return this;
    }

    public setInterval(milliseconds: number): DelayedAction {
        if (!milliseconds || typeof milliseconds !== "number") {
            throw new TypeError("Milliseconds must be a valid number");
        }

        this.interval = milliseconds;
        return this;
    }

    public getIntervalAsMilliseconds(): number {
        return this.interval || 0;
    }

    public isRepeat(): boolean {
        return this.recurrences !== 1;
    }

    /**
     * Convenience methods
     */
    public delay(amount: number, interval: string): DelayedAction {
        if (!amount || typeof amount !== "number") {
            throw new TypeError("Amount must be a valid number");
        }
        if (!interval || typeof interval !== "string") {
            throw new TypeError("Interval must be a valid string");
        }

        switch (interval) {
            case "s":
            case "sec":
            case "second":
            case "seconds":
                this.interval = this.secondAsMillis() * amount;
                break;
            case "m":
            case "min":
            case "minute":
            case "minutes":
                this.interval = this.minuteAsMillis() * amount;
                break;
            case "h":
            case "hr":
            case "hour":
            case "hours":
                this.interval = this.hourAsMillis() * amount;
                break;
            case "d":
            case "day":
            case "days":
                this.interval = this.dayAsMillis() * amount;
                break;
            case "w":
            case "week":
            case "weeks":
                this.interval = this.weekAsMillis() * amount;
                break;
            case "mo":
            case "mon":
            case "month":
            case "months":
                this.interval = this.monthAsMillis() * amount;
                break;
            case "y":
            case "yr":
            case "yrs":
            case "year":
            case "years":
                this.interval = this.yearAsMillis() * amount;
                break;
            default:
                this.interval = this.dayAsMillis();
                break;
        }

        return this;
    }

    public repeat(times?: number): DelayedAction {
        this.recurrences = times ? times : 0; // 0 = indefinitely
        return this;
    }

    public addContext(obj: {[key: string]: any}): DelayedAction {
        if (!obj || typeof obj !== "object") {
            throw new TypeError("Context must be a valid object");
        }

        this.setContext(obj);
        return this;
    }

    public setDelayFrom(timestamp?: number): DelayedAction {
        this.scheduledAt = this.calcDelayAsTimestamp(timestamp);
        return this;
    }

    /**
     * Util helper methods
     */
    protected calcDelayAsTimestamp(from?: number): number {
        const start = (from) ? from : Date.now();
        const later = start + (this.interval || 0);
        return Math.floor(later / 1000);
    }

    private secondAsMillis(): number {
        return 1000;
    }

    private minuteAsMillis(): number {
        return this.secondAsMillis() * 60;
    }

    private hourAsMillis(): number {
        return this.minuteAsMillis() * 60;
    }

    private dayAsMillis(): number {
        return this.hourAsMillis() * 24;
    }

    private weekAsMillis(): number {
        return this.dayAsMillis() * 7;
    }

    private monthAsMillis(days?: number): number {
        return this.dayAsMillis() * (days ? days : 30);
    }

    private yearAsMillis(): number {
        return this.dayAsMillis() * 365; // ignoring leap year
    }
}
