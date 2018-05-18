import * as mozjexl from "mozjexl";

import { Action } from "./Action";
import DelayedAction from "./DelayedAction";
import IAction from "./IAction";
import ImmediateAction from "./ImmediateAction";
import IRule from "./IRule";
import ITrigger from "./ITrigger";
import IWorkflow from "./IWorkflow";
import Rule from "./Rule";
import Trigger from "./Trigger";

export default class Workflow implements IWorkflow {
    protected id: string;
    protected name: string;
    protected trigger: ITrigger;
    protected rules: IRule[];
    protected actions: IAction[];
    protected evaluator: any;

    constructor(name?: string, trigger?: ITrigger, rules?: IRule[], actions?: IAction[], id?: string) {
        if (name && typeof name !== "string") {
            throw new TypeError("Name must be valid string");
        }
        if (trigger && typeof trigger !== "object") {
            throw new TypeError("Trigger must be null or valid ITrigger");
        }
        if (rules && typeof rules !== "object") {
            throw new TypeError("Rules must be null or valid IRule[]");
        }
        if (actions && typeof actions !== "object") {
            throw new TypeError("Actions must be null or valid IAction[]");
        }
        if (id && typeof id !== "string") {
            throw new TypeError("Id must be valid string");
        }

        this.name = name || undefined;
        this.trigger = trigger || undefined;
        this.rules = rules || undefined;
        this.actions = actions || undefined;
        this.id = id || undefined;

        // instantiate EL evaluator
        // TODO: consider injecting this dependency as shared
        this.evaluator = new mozjexl.Jexl();

        return this;
    }

    public getId(): string {
        return this.id || null;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getTrigger(): ITrigger {
        return this.trigger;
    }

    public setTrigger(trigger: ITrigger): void {
        this.trigger = trigger;
    }

    public getRules(): IRule[] {
        return this.rules || [];
    }

    public setRules(rules: IRule[]): void {
        this.rules = rules;
    }

    public addRule(rule: IRule): void {
        this.rules.push(rule);
    }

    public removeRule(name: string): void {
        this.rules = this.rules.filter((rule) => rule.getName() !== name);
    }

    public getActions(): IAction[] {
        return this.actions || [];
    }

    public setActions(actions: IAction[]): void {
        this.actions = actions;
    }

    public addAction(action: IAction): void {
        this.actions.push(action);
    }

    public removeAction(name: string): void {
        this.actions = this.actions.filter((action) => action.getName() !== name);
    }

    public getEvaluator(): any {
        return this.evaluator;
    }

    public setEvaluator(evaluator: any): void {
        this.evaluator = evaluator;
    }

    public getActionsForContext(context: Dictionary): Promise<IAction[]> {
        return new Promise((resolve, reject) => {
            let actionsToFire: IAction[] = [];
            let isValid: boolean = true; // optimistic default
            const rulesJobs: Array<Promise<any>> = [];

            // apply rules expressions to context if applicable
            if (this.rules && this.rules.length > 0) {
                this.rules.map((rule) => {
                    if (rule && rule.getExpression()) {
                        rulesJobs.push(this.evaluator.eval(rule.getExpression(), context));
                    }
                });
            }

            // process all rules and if still valid, return actions
            Promise.all(rulesJobs)
                .then((values) => {
                    // check for false
                    values.map((check: boolean) => {
                        if (check !== true) {
                            isValid = false;
                        }
                    });

                    if (isValid && this.actions && this.actions.length > 0) {
                        actionsToFire = this.actions;
                    }

                    resolve(actionsToFire);
                });
        });
    }

    public fromDict(dict: Dictionary): IWorkflow {
        this.id = dict.id;
        this.name = dict.name;
        this.trigger = new Trigger(dict.trigger.name);

        this.rules = []; // reset
        dict.rules.map((rule: Dictionary) => {
            this.rules.push(new Rule(rule.name, rule.expression));
        });

        this.actions = []; // reset
        dict.actions.map((action: Dictionary) => {
            if (action.interval) {
                this.actions.push(new DelayedAction(
                    action.name,
                    action.interval,
                    action.context,
                    action.scheduledAt,
                    action.recurrence,
                ));
            } else {
                this.actions.push(new ImmediateAction(
                    action.name,
                ));
            }
        });

        return this;
    }

    public toDict(): Dictionary {
        const workflowDict: Dictionary = {
            id: this.getId(),
            name: this.getName(),
            trigger: {
                name: this.getTrigger().getName(),
            },
        };

        const rules: Dictionary[] = [];
        this.getRules().map((rule: IRule) => {
            const ruleDict: Dictionary = {
                expression: rule.getExpression(),
                name: rule.getName(),
            };
            rules.push(ruleDict);
        });
        workflowDict.rules = rules;

        const actions: Dictionary[] = [];
        this.getActions().map((action: IAction) => {
            const actionDict: Dictionary = {
                context: action.getContext(),
                name: action.getName(),
                type: action.getType(),
            };
            if (action instanceof DelayedAction) {
                actionDict.scheduledAt = action.getScheduledDateAsTimestamp();
                actionDict.interval = action.getIntervalAsMilliseconds();
                actionDict.recurrence = action.getRecurrences();
            }
            actions.push(actionDict);
        });
        workflowDict.actions = actions;

        return workflowDict;
    }
}
