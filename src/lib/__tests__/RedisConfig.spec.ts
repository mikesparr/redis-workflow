import RedisConfig from "../RedisConfig";

describe("RedisConfig", () => {
    let testConfig: RedisConfig;

    const testHost: string = "locahost";
    const testPort: number = 6379;
    const testDb: number = 0;
    const testPassword: string = "password";

    it("instantiates a config object with just host and port", () => {
        testConfig = new RedisConfig(testHost, testPort);
        expect(testConfig).toBeInstanceOf(RedisConfig);
        expect(testConfig.host).toEqual(testHost);
        expect(testConfig.port).toEqual(testPort);
        expect(testConfig.db).toBeUndefined();
        expect(testConfig.password).toBeUndefined();
    });

    it("instantiates a config object with optional db and password", () => {
        const testConfig2: RedisConfig = new RedisConfig(testHost, testPort, testDb, testPassword);
        expect(testConfig2).toBeInstanceOf(RedisConfig);
        expect(testConfig2.host).toEqual(testHost);
        expect(testConfig2.port).toEqual(testPort);
        expect(testConfig2.db).toEqual(testDb);
        expect(testConfig2.password).toEqual(testPassword);
    });

    describe("setHost", () => {
        it("throws error for invalid input", () => {
            expect( () => { testConfig.setHost(null); } ).toThrow();
        });

        it("sets password", () => {
            const newHost: string = "newPass";
            testConfig.setHost(newHost);
            expect(testConfig.host).toEqual(newHost);
        });
    });

    describe("setPort", () => {
        it("throws error for invalid input", () => {
            expect( () => { testConfig.setPort(null); } ).toThrow();
        });

        it("sets db", () => {
            const newPort: number = 6699;
            testConfig.setPort(newPort);
            expect(testConfig.port).toEqual(newPort);
        });
    });

    describe("setDb", () => {
        it("throws error for invalid input", () => {
            expect( () => { testConfig.setDb(null); } ).toThrow();
        });

        it("sets db", () => {
            const newDb: number = 1;
            testConfig.setDb(newDb);
            expect(testConfig.db).toEqual(newDb);
        });
    });

    describe("setPassword", () => {
        it("throws error for invalid input", () => {
            expect( () => { testConfig.setPassword(null); } ).toThrow();
        });

        it("sets password", () => {
            const newPassword: string = "newPass";
            testConfig.setPassword(newPassword);
            expect(testConfig.password).toEqual(newPassword);
        });
    });
});
