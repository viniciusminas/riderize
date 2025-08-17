import { Resolver, Query, Mutation, Arg, Ctx, Authorized, InputType, Field } from "type-graphql";
import { Ride } from "@prisma/client";
import { MyContext } from "../utils/types";
import { IsDate, IsOptional, IsString, Length, IsNumber, Min } from "class-validator";
import { RideType } from "../schema/ride";

@InputType()
class CreateRideInput {
  @Field() @IsString() @Length(3, 50) name!: string;
  @Field() @IsDate() start_date!: Date;
  @Field() @IsDate() start_date_registration!: Date;
  @Field() @IsDate() end_date_registration!: Date;
  @Field({ nullable: true }) @IsOptional() @IsString() additional_information?: string;
  @Field() @IsString() start_place!: string;
  @Field({ nullable: true }) @IsOptional() @IsNumber() @Min(1) participants_limit?: number;
}

@Resolver(() => RideType)
export class RideResolver {
  
  @Query(() => [RideType])
  async rides(@Ctx() { prisma }: MyContext): Promise<Ride[]> {
    return prisma.ride.findMany({
      where: {
        start_date: {
          gte: new Date()
        }
      },
      include: {
        creator: true, 
        _count: { 
          select: { subscriptions: true }
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
        _count: {
          select: { subscriptions: true }
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
    if (data.end_date_registration > data.start_date) {
      throw new Error("A data final de inscrição deve ser anterior à data do pedal");
    }
    if (data.start_date_registration > data.end_date_registration) {
      throw new Error("A data de início das inscrições deve ser anterior à data final");
    }
    return prisma.ride.create({
      data: { ...data, creator: { connect: { id: user.id } } },
      include: { creator: true }
    });
  }

}