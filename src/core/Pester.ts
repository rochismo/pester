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
        getsJson: true,
    };

    private requester: any;

    constructor(requester: any, config?: PesterConfig) {
        if (config) {
            this.config = config;
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
        const response: Response = await this.requester(url, requestInit);

        return response;
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

    private triggerResponseInterceptors(response: Response, requestData: any, payload: any) {
        if (!this.isOkay(response)) {
            this.interceptors.fireErrorResponseInterceptors({ requestData, response, payload });
        } else {
            this.interceptors.fireResponseInterceptors({ requestData, response, payload });
        }
    }
    private isOkay(response: Response) {
        return response.status >= 200 && response.status >= 300;
    }

    private formatFactory(requestData: PesterData): PesterAvailableFormats {
        return {
            json: async () => {
                const response = await this.request(requestData);
                try {
                    const payload = await response.json();
                    this.triggerResponseInterceptors(response, requestData, payload);
                    if (!this.isOkay) {
                        throw { response, requestData, payload }
                    }
                    return { response, requestData, payload };
                } catch (e) {
                    const error = { error: "Error parsing response's json" };
                    this.triggerResponseInterceptors(response, requestData, error);
                    throw { response, requestData, error, secondaryError: e }
                }
            },
            text: async () => {
                try {
                    const response = await this.request(requestData);
                    const text = await response.text();
                    this.triggerResponseInterceptors(response, requestData, text);
                    return { response, requestData, payload: await response.text() }
                } catch (e) {
                    throw e;
                }
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