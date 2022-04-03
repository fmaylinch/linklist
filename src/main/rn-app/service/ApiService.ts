import {Credentials} from "../types";
import axios, {Axios} from "axios";

class ApiService {
    private credentials?: Credentials;
    private axiosInstance: Axios;

    constructor() {
        this.axiosInstance = axios;
    }

    axios() : Axios {
        return this.axiosInstance;
    }

    setCredentials(credentials: Credentials) {
        this.credentials = credentials;
        const config = {
            baseURL: credentials.baseUrl,
            headers: {Authorization: "Bearer " + credentials.token},
        };
        this.axiosInstance = axios.create(config);
    }
}

export const apiService = new ApiService();
