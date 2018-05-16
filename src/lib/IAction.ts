import { ActionType } from "./Action";

export default interface IAction {
    getName(): string;
    setName(name: string): void;
    getType(): ActionType;
    setType(type: ActionType): void;
}
