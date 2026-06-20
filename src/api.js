import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/', // 👈 Agrega este '/' al final
});

export default api;