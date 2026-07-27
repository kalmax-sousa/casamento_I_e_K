const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  // Pega o token salvo no navegador
  getToken: () => localStorage.getItem('adminToken'),

  // Faz requisições com o token embutido automaticamente
  fetchAuth: async (endpoint: string, options: RequestInit = {}) => {
    const token = api.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Se o token expirar ou for inválido, limpa e redireciona pro login
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login'; 
      throw new Error('Não autorizado');
    }

    return response;
  }
};