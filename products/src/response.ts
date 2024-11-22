export class ApiResponse<T = any> {

    statusCode: number;
    message: string;
    payload: T;

    constructor(statusCode: number, message: string, payload: T) {
        this.statusCode = statusCode;
        this.message = message;
        this.payload = payload;
    }
    
}

// export class GatewayAdapterError extends ApiResponse {

//     constructor(statusCode: number, message: string, payload: any = {}) {
//         super(statusCode, message, payload);
//     }

// }