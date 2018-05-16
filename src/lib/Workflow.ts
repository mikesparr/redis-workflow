import * as mozjexl from "mozjexl";

import IAction from "./IAction";
import IRule from "./IRule";
import ITrigger from "./ITrigger";
import IWorkflow from "./IWorkflow";

export default class Workflow implements IWorkflow {
    protected id: string;
    protected name: string;
    protected trigger: ITrigger;
    protected rules: IRule[];
    protected actions: IAction[];
    protected evaluator: any;

    constructor(name: string, trigger: ITrigger, rules: IRule[], actions: IAction[], id?: string) {
        this.name = name;
        this.trigger = trigger;
        this.rules = rules;
        this.actions = actions;

        if (id) {
            this.id = id;
        }

        // instantiate EL evaluator
        this.evaluator = new mozjexl.Jexl();
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

    public getActionsForContext(context: {[key: string]: any}): Promise<IAction[]> {
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

    public addAction(action: IAction): void {
        this.actions.push(action);
    }

    public removeAction(name: string): void {
        this.actions = this.actions.filter((action) => action.getName() !== name);
    }
}
