import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from "type-graphql";
import { Ride, Subscription, User } from "@prisma/client";
import { MyContext } from "../utils/types";
import { IsDate, IsOptional, IsString, Length, IsNumber, Min } from "class-validator";
import { InputType, Field } from "type-graphql";
import { RideType } from "../schema/ride";
import { SubscriptionType } from "../schema/subscription";

@InputType()
class CreateRideInput {
  @Field()
  @IsString()
  @Length(3, 50, { message: "O nome deve ter entre 3 e 50 caracteres" })
  name!: string;

  @Field()
  @IsDate({ message: "Data de início inválida" })
  start_date!: Date;

  @Field()
  @IsDate({ message: "Data de início das inscrições inválida" })
  start_date_registration!: Date;

  @Field()
  @IsDate({ message: "Data de término das inscrições inválida" })
  end_date_registration!: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additional_information?: string;

  @Field()
  @IsString()
  start_place!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: "O limite deve ser pelo menos 1" })
  participants_limit?: number;
}

@Resolver()
export class RideResolver {
  @Query(() => [RideType])
  async rides(@Ctx() { prisma }: MyContext): Promise<Ride[]> {
    return prisma.ride.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        start_date: 'asc'
      }
    });
  }

  @Authorized()
  @Query(() => [RideType])
  async myRides(@Ctx() { prisma, user }: MyContext): Promise<Ride[]> {
    if (!user) throw new Error("Usuário não autenticado");
    
    return prisma.ride.findMany({
      where: { 
        creatorId: user.id 
      },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  @Authorized()
  @Mutation(() => RideType)
  async createRide(
    @Arg("data") data: CreateRideInput,
    @Ctx() { prisma, user }: MyContext
  ): Promise<Ride> {
    if (!user) throw new Error("Usuário não autenticado");

    // Validação de datas
    if (data.end_date_registration > data.start_date) {
      throw new Error("A data final de inscrição deve ser anterior à data do pedal");
    }

    if (data.start_date_registration > data.end_date_registration) {
      throw new Error("A data de início das inscrições deve ser anterior à data final");
    }

    return prisma.ride.create({
      data: {
        ...data,
        creator: {
          connect: { id: user.id }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  @Authorized()
  @Mutation(() => SubscriptionType)
  async subscribeToRide(
    @Arg("rideId") rideId: string,
    @Ctx() { prisma, user }: MyContext
  ): Promise<Subscription> {
    if (!user) throw new Error("Usuário não autenticado");

    // Verifica se o pedal existe
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      throw new Error("Pedal não encontrado");
    }

    // Verifica se as inscrições estão abertas
    const now = new Date();
    if (now < ride.start_date_registration || now > ride.end_date_registration) {
      throw new Error("Fora do período de inscrições para este pedal");
    }

    // Verifica limite de participantes
    if (ride.participants_limit) {
      const subscriptionsCount = await prisma.subscription.count({
        where: { rideId }
      });

      if (subscriptionsCount >= ride.participants_limit) {
        throw new Error("Limite de participantes atingido para este pedal");
      }
    }

    return prisma.subscription.create({
      data: {
        ride: {
          connect: { id: rideId }
        },
        user: {
          connect: { id: user.id }
        }
      },
      include: {
        ride: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
}