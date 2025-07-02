import axios from 'axios';

const backendApi = axios.create({
  baseURL: 'https://chaintv.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default backendApi; 