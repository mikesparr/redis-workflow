export default class RedisConfig {
    public host: string;
    public port: number;
    public db: number;
    public password: string;

    constructor(host: string, port: number, db?: number, password?: string) {
        this.host = host;
        this.port = port;
        this.db = db ? db : null;
        this.password = password ? password : null;
    }
}
