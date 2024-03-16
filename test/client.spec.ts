import { ERRORS, MontonioClient, MontonioClientOptions } from "../src";

describe("MontonioClient", () => {
    let options: MontonioClientOptions;

    beforeEach(() => {
        options = {
            accessKey: "testAccessKey",
            secretKey: "testSecretKey",
            sandbox: true,
        };
    });

    it("should correctly initialize with provided options", () => {
        const client = new MontonioClient(options);

        expect(client).toHaveProperty("accessKey", options.accessKey);
        expect(client).toHaveProperty("secretKey", options.secretKey);
        expect(client).toHaveProperty("baseUrl", "https://sandbox-stargate.montonio.com/api");
    });

    it("should throw an error when required options are missing", () => {
        options.accessKey = "";
        options.secretKey = "";

        expect(() => new MontonioClient(options)).toThrowError(ERRORS.MISSING_OPTIONS);
    });
});
