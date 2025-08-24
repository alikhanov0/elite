import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://elite-5ea3.onrender.com/api', // или твой бекенд URL
  headers: {
    'Content-Type': 'application/json',
  }
})

// ⛓️ автоматическое добавление токена
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
