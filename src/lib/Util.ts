
export default class Util {
    constructor() { /* pass */ }

    /* tslint:disable */
    static hash(str: string): number {
        let hash: number = 0;
        const strlen: number = str.length;

        if (strlen === 0) { return hash; }

        for (let i = 0; i < strlen; ++i) {
            const code: number = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + code;
            hash &= hash; // Int32
        }
        return (hash >>> 0); // uInt32
    }
    /* tslint:enable */
}
