import { ObjectType, Field, Int } from "type-graphql";
import { RideType } from "./ride";

@ObjectType()
export class SubscriptionType {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  rideId!: number;

  @Field(() => Int)
  userId!: number;

  @Field()
  subscription_date!: Date;

  @Field(() => RideType, { nullable: true })
  ride?: RideType;
}
