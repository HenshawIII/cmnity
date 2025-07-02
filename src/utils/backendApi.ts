import axios from 'axios';

const backendApi = axios.create({
  baseURL: 'http://localhost:5300/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendApi; 