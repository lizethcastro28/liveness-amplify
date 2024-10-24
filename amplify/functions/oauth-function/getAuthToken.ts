// getAuthToken.ts

import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

export const getAuthToken = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.log('----------->>>getAuthToken: ', event)
    try {
        const session = 'token';

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(session)
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
