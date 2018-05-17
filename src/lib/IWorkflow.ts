import IAction from "./IAction";
import IRule from "./IRule";
import ITrigger from "./ITrigger";

export default interface IWorkflow {
    getId(): string;
    setId(id: string): void;
    getName(): string;
    setName(name: string): void;
    getTrigger(): ITrigger;
    setTrigger(trigger: ITrigger): void;
    getRules(): IRule[];
    setRules(rules: IRule[]): void;
    addRule(rule: IRule): void;
    removeRule(name: string): void;
    getActions(): IAction[];
    setActions(actions: IAction[]): void;
    getActionsForContext(context: Dictionary): Promise<IAction[]>;
    addAction(action: IAction): void;
    removeAction(name: string): void;
}
