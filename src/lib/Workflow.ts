import IAction from "./IAction";
import IRule from "./IRule";
import ITrigger from "./ITrigger";
import IWorkflow from "./IWorkflow";

export default class Workflow implements IWorkflow {
    protected name: string;
    protected trigger: ITrigger;
    protected rules: [IRule];
    protected actions: [IAction];

    constructor(name: string, trigger: ITrigger, rules: [IRule], actions: [IAction]) {
        this.name = name;
        this.trigger = trigger;
        this.rules = rules;
        this.actions = actions;
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

    public getRules(): [IRule] {
        return this.rules;
    }

    public setRules(rules: [IRule]): void {
        this.rules = rules;
    }

    public addRule(rule: IRule): void {
        this.rules.push(rule);
    }

    public getActions(): [IAction] {
        return this.actions;
    }

    public setActions(actions: [IAction]): void {
        this.actions = actions;
    }

    public addAction(action: IAction): void {
        this.actions.push(action);
    }
}
