// getConfig.ts
import AWS from 'aws-sdk';
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAuthToken } from '../oauth-function/getAuthToken';

const lambda = new AWS.Lambda();

export const getConfig = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.log('----------->>>getConfig: ', event);

    try {

        const token = await getAuthToken(event);

        console.log('------->>>desde el lambda: ', token)

        const circuit = '3f7f6d9b-55d4-4972-8db3-11bdf456d2bb';
        const url = `https://biometric.integrationlayer.com/api/v1/biometric/internal/get_channel/${circuit}`;

        // Realizar la solicitud GET a la API externa utilizando el token
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

        // Devuelve los datos en la respuesta
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify(data),
        };

    } catch (error: unknown) {
        console.error('Error en getConfig:', error);

        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};
