import ITrigger from "./ITrigger";

export default class Trigger implements ITrigger {
    protected name: string;

    constructor(name: string) {
        // console.log(`Trigger '${name}' initiated`);
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }
}
