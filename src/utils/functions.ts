// utils/apiService.ts

export async function fetchBiometricData(token: string): Promise<any> {
  const url = 'https://biometric.integrationlayer.com/api/v1/biometric/internal/get_channel/13713848-8259-11ef-989d-2cdb0755c8f0/040d2874-e356-4ed5-9c7b-e44d96da2928';

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/zip', 
          },
      });

      // Verifica si la respuesta es exitosa
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); 
      return data; 

  } catch (error) {
      console.error('Error al llamar al servicio:', error);
      throw error; 
  }
}

export async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  result += decoder.decode(); // Decodificar los últimos datos
  return result;
}