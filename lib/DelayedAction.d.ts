import { Action } from "./Action";
export default class DelayedAction extends Action {
    protected scheduledAt: number;
    protected recurrences: number;
    protected interval: number;
    constructor(name: string, intervalAsMillis?: number, context?: Dictionary, delayAsTimestamp?: number, recurrences?: number);
    getScheduledDateAsTimestamp(): number;
    setScheduledDate(timestamp: number): DelayedAction;
    setInterval(milliseconds: number): DelayedAction;
    getIntervalAsMilliseconds(): number;
    getRecurrences(): number;
    isRepeat(): boolean;
    delay(amount: number, interval: string): DelayedAction;
    repeat(times?: number): DelayedAction;
    setScheduledDateFrom(timestamp?: number): DelayedAction;
    protected calcDelayAsTimestamp(from?: number): number;
    private secondAsMillis;
    private minuteAsMillis;
    private hourAsMillis;
    private dayAsMillis;
    private weekAsMillis;
    private monthAsMillis;
    private yearAsMillis;
}
