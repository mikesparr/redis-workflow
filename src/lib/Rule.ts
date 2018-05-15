import IRule from "./IRule";

export default class Rule implements IRule {
    constructor(name: string, expression: string, context?: any) {
        // console.log(`Rule '${name}' initiated`);
    }
}
