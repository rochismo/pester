import { workingInstance } from './generator';
import './dummy-server'

describe('Interceptors test', function() {
    workingInstance.interceptors.addRequestInterceptor({callback(data) {
        data.headers.Authorization = "Bearer hello";
    }});
    workingInstance.interceptors.addResponseInterceptor({ error(data) {
        data.payload["myError"] = true;
    }, success(data) {
        data.payload["modified"] = true;
    }})

    it("Authorization header must be set to 'Bearer hello", async function() {
        const data = await workingInstance.get("/");
        return data.requestData.headers.Authorization === "Bearer hello";
    })

    it("Should have a property 'modified' added to the payload", async function() {
        const data = await workingInstance.get("/");
        return data.payload.modified;
    })
    it("Should have a property 'myError' added to the payload", async function() {
        const data = await workingInstance.get("/asd");
        return data.payload.myError;
    })
})