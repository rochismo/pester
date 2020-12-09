import { notWorkingInstance, workingInstance } from './generator';
import './dummy-server'


describe('perform a request on an offline server', function () {
    it('should return an object that specifies it had error and a payload with an object that contains a message saying its disconnected', async function () {
        const response = await notWorkingInstance.get("/");
        return response.payload.message === "You are offline" && response.hadError;
    })
});

describe('Perform a request on an online server', function () {
    it("Should return a json with a key of message and value of 'Hello World'", async function () {
        const data = await workingInstance.get("/")
        return data.payload.message === "Hello world";
    });

    it("Should return a not found message", async function () {
        const data = await workingInstance.get("/a");
        return data.payload.message === "Not found";
    });

    it("Should return a message displaying that it failed to parse json", async function () {
        const data = await workingInstance.get("/fail-json");
        return data.payload.message === "Failed to parse json";
    })
})