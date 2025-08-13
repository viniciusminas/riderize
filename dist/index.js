"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const client_1 = require("@prisma/client");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const type_graphql_1 = require("type-graphql");
const user_resolver_1 = require("./resolvers/user-resolver");
const ride_resolver_1 = require("./resolvers/ride-resolver");
const subscription_resolver_1 = require("./resolvers/subscription-resolver");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function startServer() {
    const app = (0, express_1.default)();
    const prisma = new client_1.PrismaClient();
    // Construa o schema com todos os resolvers
    const schema = await (0, type_graphql_1.buildSchema)({
        resolvers: [
            user_resolver_1.UserResolver,
            ride_resolver_1.RideResolver,
            subscription_resolver_1.SubscriptionResolver
        ],
        authChecker: () => true, // Ignora autenticação
        validate: false
    });
    const server = new server_1.ApolloServer({ schema });
    await server.start();
    app.use('/graphql', (0, cors_1.default)(), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const token = req.headers.authorization?.replace('Bearer ', '');
            let user;
            if (token) {
                try {
                    const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    const foundUser = await prisma.user.findUnique({
                        where: { id: payload.userId }
                    });
                    user = foundUser ?? undefined;
                }
                catch (error) {
                    console.warn('Invalid token:', error);
                }
            }
            return {
                prisma,
                user
            };
        }
    }));
    app.listen(4000, () => {
        console.log('Server running on http://localhost:4000/graphql');
    });
}
startServer().catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});
