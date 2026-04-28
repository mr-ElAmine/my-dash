import axios from "axios";

const API_URL = "http://192.168.1.7:8080";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  responseType: "json",
});
