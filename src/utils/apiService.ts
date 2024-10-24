// utils/apiService.ts
export const fetchData = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener datos de ${url}:`, error);
    return null;
  }
};
