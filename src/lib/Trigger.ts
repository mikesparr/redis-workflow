import ITrigger from "./ITrigger";

export default class Trigger implements ITrigger {
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }
}
