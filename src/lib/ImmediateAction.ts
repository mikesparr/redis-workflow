import { Action, ActionType } from "./Action";
import IAction from "./IAction";

export default class ImmediateAction extends Action {
    constructor(name: string) {
        // valid name check in super

        super(
            name,
            ActionType.Immediate,
        );

        return this;
    }
}
