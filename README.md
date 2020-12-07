# Pester

## Why?

Because i need a fetch wrapper that supports interceptors and adds all the things i need automatically

## Usage

To use it follow the snippet

```javascript
import { Pester } from '@rochismo/pester';

// I don't know why you need to re-bind  it
const pesterConfig = {
    /**
     * This will automatically call response.json(), 
     * you won't have to specify manually upon it's call (shown later)
     */
    treatEverythingAsJson: true, 
    /**
     * This sets the header Content-Type to application/json, 
     * if it's not set, or set to false the header will be set to form data
     */ 
    sendsJson: true,  
    /**
     * This sets the url that the library will point to (defaults to "/")
     */
    baseUrl: "http:/localhost:3000" 
}
const instance = Pester.create(window.fetch.bind(window), pesterConfig)

instance.interceptors.addRequestInterceptor({
    callback(data) {
        // You can access the following properties
        /**
         * Even though you can access the uri, the method, and the request data, 
         * i would not touch them because that could cause unexpected behavior
         * headers?: PesterHeaders; 
         * uri?: string;
         * requestData?: any;
         * method?: string;
         */
        data.headers.Authorization = "Bearer Token";
    }
})
instance.interceptors.addResponseInterceptor({
    /**
     * The data param contains the following in both success and error callback
     * response: FetchResponse (Response), This is the response object that fetch will give you
     * requestData: PesterData;
     *      Even though you can access the uri, the method, and the request data,
     *      i would not touch them because that could cause unexpected behavior
     *      - headers?: PesterHeaders;
     *      - uri?: string;
     *      - requestData?: any;
     *      - method?: string;
     * payload: any; This is what the server returns either text or json (blob is not contemplated yet)
     */ 
    success(data) {
        // Useful if you need refresh tokens
        if (data.payload.token) {
            doSomethingWithToken(data.payload.token);
        }
    },
    // Optional
    error(data) {

    } 
})

async function test() {
    await instance.post("/test", { message: "Hello from Pester"});
    await instance.get("/test");

    // If not set "treatEverythingAsJson" to true
    await instance.post("/test", { message: "Hello from Pester"}).json() // or .text();
    await instance.get("/test").json() // or .text();
}
test();
```

## Errors?
### Fetch errors
If the call to json() to parse the request body fails, it will return an error 
instead of throwing an exception so you can avoid using try catch blocks.

### Interceptor errors
If any interceptor causes an error, it will throw an error with a message displaying 
what interceptor caused the error, by displaying the interceptor type and the  interceptor ID, along with the stacktrace

### Unhandled errors
As any other unhandled errors, you will have to handle them by yourself

## TODO's
[] When a network error occurrs, return a generic error object instead of an object like "{ data }"