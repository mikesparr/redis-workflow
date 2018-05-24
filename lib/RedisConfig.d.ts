export default class RedisConfig {
    host: string;
    port: number;
    db: number;
    password: string;
    constructor(host: string, port: number, db?: number, password?: string);
    setHost(host: string): RedisConfig;
    setPort(port: number): RedisConfig;
    setDb(id: number): RedisConfig;
    setPassword(password: string): RedisConfig;
}
