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
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' },
                        role: { type: 'string', enum: ['user', 'artisan'], example: 'user' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5c...' },
                        data: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '65f6c82bbd5e2a14e0a7f34c' },
                                name: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' },
                                role: { type: 'string', example: 'user' }
                            }
                        }
                    }
                }
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
