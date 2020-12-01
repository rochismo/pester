import { PesterData, PesterRequestInterceptor, PesterResponseInterceptor, Manager, ResponseInterceptorData } from './../types';


class ResponseInterceptorManager implements Manager {
    private interceptors: Array<PesterResponseInterceptor> = [];

    addInterceptor(interceptor: PesterResponseInterceptor): void {
        if (!interceptor.error) {
            interceptor.error = function (response) {
                return Promise.reject(response);
            }
        }
        interceptor.id = this.interceptors.length + 1;
        this.interceptors.push(interceptor);
    }

    fire(data: ResponseInterceptorData): void {
        this.interceptors.forEach(({ success, id }) => {
            try {
                success(data)
            } catch (e) {
                throw { message: `Error inside Request Interceptor (Success type): Interceptor ID ${id}`, error: e, data}
            }
        });
    }
    error(data: ResponseInterceptorData): void {
        this.interceptors.forEach(({ error, id }) => {
            try {
                error(data)
            } catch (e) {
                throw { message: `Error inside Request Interceptor (Error type): Interceptor ID ${id}`, error: e, data}
            }
        });
    }

}

class RequestInterceptorManager implements Manager {
    private interceptors: Array<PesterRequestInterceptor> = [];

    addInterceptor(interceptor: PesterRequestInterceptor): void {
        interceptor.id = this.interceptors.length + 1;
        this.interceptors.push(interceptor);
    }
    fire(data: PesterData): void {
        this.interceptors.forEach(interceptor => {
            try {
                interceptor.callback(data);
            } catch (e) {
                throw { message: `Request Interceptor Error: Interceptor ID = ${interceptor.id}`, error: e, data }
            }
        });
    }

}
export default class InterceptorManager {
    private responseManager: Manager = new ResponseInterceptorManager();
    private requestManager: Manager = new RequestInterceptorManager();

    public addRequestInterceptor(interceptor: PesterRequestInterceptor): void {
        this.requestManager.addInterceptor(interceptor);
    }

    public addResponseInterceptor(interceptor: PesterResponseInterceptor): void {
        this.responseManager.addInterceptor(interceptor);
    }

    public fireRequestInterceptors(data: PesterData) {
        this.requestManager.fire(data)
    }

    public fireResponseInterceptors(response: ResponseInterceptorData) {
        this.responseManager.fire(response);
    }

    public fireErrorResponseInterceptors(data: ResponseInterceptorData) {
        this.responseManager.error(data);
    }
}