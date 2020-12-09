/* tslint:disable */
import { PesterConfig, PesterHeaders, PesterData, PesterContract, PesterAvailableFormats, ResponseInterceptorData } from './../types';
import { BodyMethods, BodylessMethods } from './Methods'
import { buildUrl } from './util/UrlBuilder';
import InterceptorManager from './InterceptorManager';

export class InternalPester implements PesterContract {
    public interceptors: InterceptorManager = new InterceptorManager();

    private baseUrl: string = "/";
    private baseHeaders: PesterHeaders = {};
    private requestData: PesterData = {};

    private config: PesterConfig = {
        treatEverythingAsJson: true,
        baseUrl: "/",
        sendsJson: true,
    };

    private requester: any;

    constructor(requester: any, config?: PesterConfig) {
        if (config) {
            this.config = {
                ...this.config,
                ...config
            };
        }
        this.requester = requester;
        this.parseConfig(config);
        this.setupMethods();
    }

    private setupMethods() {
        this.setupBodylessMethods();
        this.setupBodyMethods();
    }

    private parseConfig(config?: PesterConfig) {
        if (config?.baseUrl) {
            this.baseUrl = config.baseUrl;
        }

        if (config?.sendsJson) {
            this.baseHeaders["Content-Type"] = "application/json";
        } else {
            // Sends basic form data
            this.baseHeaders["Content-Type"] = "application/x-www-form-urlencoded"
        }
        this.requestData.headers = this.baseHeaders;
    }


    public async request(data: PesterData): Promise<ResponseInterceptorData> {
        this.interceptors.fireRequestInterceptors(data);

        const url = buildUrl(this.baseUrl, data.uri);
        const requestInit: RequestInit = this.buildRequestInit(data);
        try {
            const response: Response = await this.requester(url, requestInit);

            return { response, payload: response, hadError: false, requestData: data };
        } catch (e) {
            return { hadError: true, payload: { message: "You are offline" }, requestData: data };
        }
    }


    private buildRequestInit(data: PesterData): RequestInit {
        const info: RequestInit = {
            method: data.method,
            headers: { ...data.headers },
            body: data.requestData
        }
        if (this.config.sendsJson) {
            info.body = JSON.stringify(info.body);
        }
        return info;
    }


    private setupBodylessMethods() {
        BodylessMethods.forEach(method =>
            this[method] = (uri: string = "") => {
                const types = this.formatFactory({ method, headers: this.baseHeaders, uri });
                if (this.config.treatEverythingAsJson) {
                    return types.json();
                }
                return types;
            });
    }

    private setupBodyMethods() {
        BodyMethods.forEach(method =>
            this[method] = (uri: string = "", requestData: any = {}) => {
                const types = this.formatFactory({ method, headers: this.baseHeaders, uri, requestData });
                if (this.config.treatEverythingAsJson) {
                    return types.json();
                }
                return types;
            });
    }

    private isOkay(response: Response) {
        return response.ok;
    }

    private formatFactory(requestData: PesterData): PesterAvailableFormats {
        return {
            json: async () => {
                const data: ResponseInterceptorData = await this.request(requestData);
                if (data.hadError) {
                    return data;
                }
                try {
                    const payload = await data.response.json();
                    data.payload = payload;
                    if (!this.isOkay(data.response)) {
                        data.hadError = true;
                        this.interceptors.fireErrorResponseInterceptors(data);
                        return data;
                    }
                    data.payload = payload;
                    this.interceptors.fireResponseInterceptors(data);
                } catch (e) {
                    data.hadError = true;
                    data.payload = { message: "Failed to parse json" };
                    this.interceptors.fireErrorResponseInterceptors(data);
                }
                return data;
            },
            text: async () => {
                const response: any = await this.request(requestData);
                if (response.hadError) {
                    return { payload: response, hadError: true }
                }
                const text = await response.text();
                const data = { requestData, response, payload: text, hadError: false };
                if (!this.isOkay(response)) {
                    data.hadError = true;
                    this.interceptors.fireErrorResponseInterceptors(data);
                    return data
                }
                this.interceptors.fireResponseInterceptors(data);
                return data;
            }
        }
    }

    get(uri: string): PesterAvailableFormats | any {
        const types = this.formatFactory({ method: "GET", headers: this.baseHeaders, uri });
        if (this.config.treatEverythingAsJson) {
            return types.json();
        }
        return types;
    }
    delete(uri: string): PesterAvailableFormats | any {
        const types = this.formatFactory({ method: "DELETE", headers: this.baseHeaders, uri });
        if (this.config.treatEverythingAsJson) {
            return types.json();
        }
        return types;
    }
    post(uri: any, data: any): PesterAvailableFormats | any {
        const types = this.formatFactory({ method: "POST", headers: this.baseHeaders, uri, requestData: data });
        if (this.config.treatEverythingAsJson) {
            return types.json();
        }
        return types;
    }
    put(uri: string, data: any): PesterAvailableFormats | any {
        const types = this.formatFactory({ method: "PUT", headers: this.baseHeaders, uri, requestData: data });
        if (this.config.treatEverythingAsJson) {
            return types.json();
        }
        return types;
    }
    patch(uri: string, data: any): PesterAvailableFormats | any {
        const types = this.formatFactory({ method: "PATCH", headers: this.baseHeaders, uri, requestData: data });
        if (this.config.treatEverythingAsJson) {
            return types.json();
        }
        return types;
    }
}



export class Pester {
    static create(requester: any, config?: PesterConfig): InternalPester {
        return new InternalPester(requester, config);
    }
}