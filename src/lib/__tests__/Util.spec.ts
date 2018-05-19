import Util from "../Util";

describe("Util", () => {
    it("instantiates", () => {
        expect(new Util()).toBeInstanceOf(Util);
    });

    describe("hash", () => {
        it("throws error if invalid value", () => {
            expect( () => { Util.hash(null); } ).toThrow();
        });

        it("returns 0 if empty string", () => {
            expect(Util.hash("")).toEqual(0);
        });

        it("returns unsigned int hash of string", () => {
            expect(Util.hash("Hello, world")).toEqual(3818678700);
        });
    });
});
