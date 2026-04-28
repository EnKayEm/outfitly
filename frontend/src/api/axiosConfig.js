import axios from 'axios';

// 1. Tworzymy główną instancję z bazowym adresem API Backendowego
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// 2. REQUEST INTERCEPTOR - Uruchamia się przed każdym wysłaniem zapytania
api.interceptors.request.use(
  (config) => {
    // Pobieramy token Access z pamięci przeglądarki
    const token = localStorage.getItem('access_token');
    if (token) {
      // Jeśli token istnieje, doklejamy go jako nagłówek Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR - Nasłuchuje na odpowiedzi z serwera (np. na błędy autoryzacji)
api.interceptors.response.use(
  (response) => response, // Jeśli odpowiedź jest poprawna, po prostu ją zwracamy
  async (error) => {
    const originalRequest = error.config;

    // Sprawdzamy, czy dostaliśmy błąd 401 (Wygasły token) i czy zapytanie nie było już ponawiane
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Próba odświeżenia tokena uderzając w endpoint /auth/refresh/
        const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
          refresh: refreshToken,
        });

        // Jeśli się udało, zapisujemy nowy access_token
        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Podmieniamy stary token w oryginalnym zapytaniu na nowy i ponawiamy strzał do API
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Jeśli refresh_token też wygasł, czyścimy dane użytkownika i wyrzucamy do logowania
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;