import axios from 'axios';

export const myAxios = axios.create({
    baseURL: 'http://linklist.es/'
});

export function setAxiosToken(token) {
    myAxios.defaults.headers.common['Authorization'] = "Bearer " + token;
}
