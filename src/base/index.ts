import axios, { AxiosError, AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

import { ApiError, ERRORS, MontonioErrorResponse, NetworkError } from "../errors";

export abstract class MontonioBaseClient {
    protected readonly baseUrl: string;
    protected readonly axiosInstance: AxiosInstance;
    protected readonly accessKey: string;
    protected readonly secretKey: string;

    protected constructor(accessKey: string, secretKey: string, baseUrl: string) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.baseUrl = baseUrl;
        this.axiosInstance = axios.create({ baseURL: baseUrl });
    }

    protected getAuthorizationHeader() {
        const payload = { accessKey: this.accessKey };
        const token = jwt.sign(payload, this.secretKey, { algorithm: "HS256", expiresIn: "10m" });
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    protected handleAxiosError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<MontonioErrorResponse>;
            if (axiosError.response) {
                throw new ApiError(`${ERRORS.API_REQUEST_FAILED}${axiosError.message} ${ERRORS.API_MONTONIO_RESPONSE}${axiosError.response.data.message}`);
            } else if (axiosError.request) {
                throw new NetworkError(`${ERRORS.NETWORK_ERROR}${axiosError.message}`);
            } else {
                throw new Error(axiosError.message);
            }
        }
        throw error;
    }
}
