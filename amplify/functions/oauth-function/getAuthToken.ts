// getAuthToken.ts

import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const getAuthToken = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.log('----------->>>getAuthToken: ');
  
    const clientId = '4ee8r9uhojc9kjmfmnni9qpepo';
    const clientSecret = '1bikej0uo2cb4icqf2mtai1bu386qikgenvdmt1o8flmu5g3us5b';

    try {
        // Codifica las credenciales en Base64
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // Configura los encabezados para la solicitud
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
        };

        // Configura el cuerpo de la solicitud
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
        });

        // Realiza la solicitud POST usando fetch
        const response = await fetch('https://integrationlayer.auth.us-east-2.amazoncognito.com/oauth2/token', {
            method: 'POST',
            headers: headers,
            body: body.toString(),
        });

        // Verifica si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Devuelve el token en la respuesta
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(data),
        };

    } catch (error: unknown) {
        console.error('Error get oauthToken:', error);

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
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
