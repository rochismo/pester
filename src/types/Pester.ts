export interface Manager {
    fire(data: any): void;
    error?(error: any): void;
    addInterceptor(interceptor: any): void;
}

export interface ResponseInterceptorData {
    response: Response,
    requestData: PesterData;
    payload: any;
    hadError: boolean;
}


export interface PesterConfig {
    sendsJson?: boolean;
    baseUrl?: string;
    treatEverythingAsJson?: boolean;
}

export interface PesterHeaders {
    "Content-Type"?: string;
    Authorization?: string;
    method?: string;
}

export interface PesterRequestInterceptor {
    callback(data: PesterData): void;
    id?: number;
}

export interface PesterResponseInterceptor {
    success(data: ResponseInterceptorData): void;
    error?(data: ResponseInterceptorData): void;
    id?: number;
}

export interface PesterData {
    headers?: PesterHeaders;
    uri?: string;
    requestData?: any;
    method?: string;
}

export interface PesterAvailableFormats {
    json(): Promise<any>;
    text(): Promise<any>;
}

export interface PesterContract {
    get(uri: string): PesterAvailableFormats;
    delete(uri: string): PesterAvailableFormats;

    post(uri: string, data: any): PesterAvailableFormats;
    put(uri: string, data: any): PesterAvailableFormats;
    patch(uri: string, data: any): PesterAvailableFormats;
}