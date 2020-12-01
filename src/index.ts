import {Pester, InternalPester } from './core/Pester';
import fetch from 'node-fetch'
const instance: InternalPester = Pester.create(fetch, { baseUrl: "http://localhost:3000", getsJson: true, treatEverythingAsJson: true })
instance.interceptors.addResponseInterceptor({
    success(data) {
    },
    error(data) {
        //
        Promise.reject(data);
    }
})
instance.interceptors.addRequestInterceptor({ callback(data) {
}})
instance.get("/test")
export default Pester;