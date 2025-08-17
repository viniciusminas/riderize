import 'reflect-metadata';
import { PrismaClient, User } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user-resolver';
import { RideResolver } from './resolvers/ride-resolver';
import { SubscriptionResolver } from './resolvers/subscription-resolver';
import { MyContext } from './utils/types';
import jwt from 'jsonwebtoken';

async function startServer() {
  const app = express();
  const prisma = new PrismaClient();


  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      RideResolver,
      SubscriptionResolver
    ],
    authChecker: () => true,
    validate: false
  });

  const server = new ApolloServer<MyContext>({ schema });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        let user: User | undefined;

        if (token) {
          try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const foundUser = await prisma.user.findUnique({
              where: { id: payload.userId }
            });
            user = foundUser ?? undefined;
          } catch (error) {
            console.warn('Invalid token:', error);
          }
        }

        return {
          prisma,
          user
        };
      }
    })
  );

  app.listen(4000, () => {
    console.log('Server running on http://localhost:4000/graphql');
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});