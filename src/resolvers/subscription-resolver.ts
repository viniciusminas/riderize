import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { Subscription as PrismaSubscription } from "@prisma/client";
import { MyContext } from "../utils/types"; // Caminho relativo correto
import { SubscriptionType } from "../schema/subscription";
import { IsUUID } from "class-validator";
import { InputType, Field } from "type-graphql";

@InputType()
class SubscribeToRideInput {
  @Field()
  @IsUUID()
  rideId!: string;
}

@Resolver(SubscriptionType)
export class SubscriptionResolver {
  @Authorized()
  @Query(() => [SubscriptionType])
  async mySubscriptions(
    @Ctx() { prisma, user }: MyContext
  ): Promise<PrismaSubscription[]> {
    if (!user) throw new Error("Usuário não autenticado");

    return prisma.subscription.findMany({
      where: { 
        userId: user.id 
      },
      include: { 
        ride: {
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        subscription_date: 'desc'
      }
    });
  }

  @Authorized()
  @Mutation(() => SubscriptionType)
  async subscribeToRide(
    @Arg("data") { rideId }: SubscribeToRideInput,
    @Ctx() { prisma, user }: MyContext
  ): Promise<PrismaSubscription> {
    if (!user) throw new Error("Usuário não autenticado");

    // Verifica se o pedal existe
    const ride = await prisma.ride.findUnique({ 
      where: { id: rideId },
      include: { 
        subscriptions: true,
        creator: {
          select: {
            id: true
          }
        }
      } 
    });

    if (!ride) {
      throw new Error("Pedal não encontrado");
    }

    // Verifica se o usuário é o criador do pedal
    if (ride.creator.id === user.id) {
      throw new Error("Você não pode se inscrever no próprio pedal");
    }

    // Verifica se já está inscrito
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        rideId,
        userId: user.id
      }
    });

    if (existingSubscription) {
      throw new Error("Você já está inscrito neste pedal");
    }

    // Verifica período de inscrições
    const now = new Date();
    if (now < ride.start_date_registration) {
      throw new Error("Inscrições ainda não abertas para este pedal");
    }

    if (now > ride.end_date_registration) {
      throw new Error("Inscrições encerradas para este pedal");
    }

    // Verifica limite de participantes
    if (ride.participants_limit && ride.subscriptions.length >= ride.participants_limit) {
      throw new Error("Limite de participantes atingido");
    }

    return prisma.subscription.create({
      data: {
        rideId,
        userId: user.id,
        subscription_date: now
      },
      include: {
        ride: {
          include: {
            creator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  @Authorized()
  @Mutation(() => Boolean)
  async unsubscribeFromRide(
    @Arg("rideId") rideId: string,
    @Ctx() { prisma, user }: MyContext
  ): Promise<boolean> {
    if (!user) throw new Error("Usuário não autenticado");

    const subscription = await prisma.subscription.findFirst({
      where: {
        rideId,
        userId: user.id
      }
    });

    if (!subscription) {
      throw new Error("Inscrição não encontrada");
    }

    await prisma.subscription.delete({
      where: {
        id: subscription.id
      }
    });

    return true;
  }
}