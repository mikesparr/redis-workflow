import ITrigger from "./ITrigger";
export default class Trigger implements ITrigger {
    protected name: string;
    constructor(name: string);
    getName(): string;
    setName(name: string): void;
}
