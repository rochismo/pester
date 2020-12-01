/* tslint:disable */
import { PesterConfig, PesterHeaders, PesterData, PesterContract, PesterAvailableFormats } from './../types';
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


    public async request(data: PesterData) {
        this.interceptors.fireRequestInterceptors(data);

        const url = buildUrl(this.baseUrl, data.uri);
        const requestInit: RequestInit = this.buildRequestInit(data);
        try {
            const response: Response = await this.requester(url, requestInit);

            return response;
        } catch(e) {
            return {hadError: true, error: e};
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
                const response: any = await this.request(requestData);
                if (response.hadError) {
                    return { data: response }
                }
                try {
                    const payload = await response.json();
                    const data = { response, requestData, payload, hadError: false }
                    if (!this.isOkay(response)) {
                        data.hadError = true;
                        this.interceptors.fireErrorResponseInterceptors(data);
                        return data;
                    }
                    this.interceptors.fireResponseInterceptors(data);
                    return data;
                } catch (e) {
                    this.interceptors.fireErrorResponseInterceptors({ requestData, response, payload: e, hadError: true });
                    return { requestData, response, payload: e, error: "Failed to parse json" }
                }
            },
            text: async () => {
                const response: any = await this.request(requestData);
                if (response.hadError) {
                    return { data: response }
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

    get(uri: string): PesterAvailableFormats {
        throw new Error('Method not implemented.');
    }
    delete(uri: string): PesterAvailableFormats {
        throw new Error('Method not implemented.');
    }
    post(uri: any, data: any): PesterAvailableFormats {
        throw new Error('Method not implemented.');
    }
    put(uri: string, data: any): PesterAvailableFormats {
        throw new Error('Method not implemented.');
    }
    patch(uri: string, data: any): PesterAvailableFormats {
        throw new Error('Method not implemented.');
    }
}



export class Pester {
    static create(requester: any, config?: PesterConfig): InternalPester {
        return new InternalPester(requester, config);
    }
}