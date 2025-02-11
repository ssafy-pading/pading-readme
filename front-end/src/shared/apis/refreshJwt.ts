import axios from 'axios';

export const refreshJwt = async (): Promise<string | null> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/v1/auth/refresh`, {
      refreshToken: `Bearer ${localStorage.getItem('refreshToken')}`,
    });
    const newToken = response.data?.data;
    if (newToken) {
      localStorage.setItem('accessToken', newToken.accessToken);
      localStorage.setItem('refreshToken', newToken.refreshToken);
    }
    return newToken.accessToken;
  } catch (error) {
    console.error('Error refreshing JWT:', error);
    return null;
  }
};
