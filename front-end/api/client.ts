import axios from "axios";

const API_URL = "http://172.20.10.4:8080";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  responseType: "json",
});
