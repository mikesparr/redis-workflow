import { Action, ActionType } from "./Action";
import IAction from "./IAction";

export default class ImmediateAction extends Action {
    constructor(name: string) {
        super(
            name,
            ActionType.Immediate,
        );
    }
}
