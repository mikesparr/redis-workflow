import { Action, ActionType } from "./Action";
import IAction from "./IAction";

export default class DelayedAction extends Action {
    protected context: {[key: string]: any};
    protected delay: number;
    protected repeat: boolean;
    protected interval: number;

    constructor(name: string, context: {[key: string]: any},
                delayAsTimestamp?: number, intervalAsMillis?: number, repeat?: boolean) {
        super(
            name,
            ActionType.Delayed,
        );

        this.context = context;
    }

    public getContext(): {[key: string]: any} {
        return this.context;
    }

    public setContext(context: {[key: string]: any}) {
        this.context = context;
    }

    public getDelayAsTimestamp(): number {
        return this.delay;
    }

    public setDelay(timestamp: number) {
        this.delay = timestamp;
    }

    public setInterval(milliseconds: number) {
        this.interval = milliseconds;
    }

    public getIntervalAsMilliseconds(): number {
        return this.interval || 0;
    }

    public isRepeat(): boolean {
        return this.repeat || false;
    }
}
