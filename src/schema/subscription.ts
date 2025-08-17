import { ObjectType, Field, Int, ID } from "type-graphql";
import { RideType } from "./ride";

@ObjectType()
export class SubscriptionType {
  @Field(() => ID)
  id!: String;

  @Field(() => ID)
  rideId!: String;

  @Field(() => ID)
  userId!: String;

  @Field()
  subscription_date!: Date;

  @Field(() => RideType, { nullable: true })
  ride?: RideType;
}
