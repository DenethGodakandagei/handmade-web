import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Artisan Connect API',
            version: '1.0.0',
            description: 'API Documentation for Artisan Connect',
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

export default specs;
