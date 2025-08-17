import { ObjectType, Field, Int, ID } from "type-graphql";
import { UserType } from "./user";          
import { SubscriptionType } from "./subscription"; 

@ObjectType()
export class RideType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  start_date!: Date;

  @Field()
  start_date_registration!: Date;

  @Field()
  end_date_registration!: Date;

  @Field({ nullable: true })
  additional_information?: string;

  @Field()
  start_place!: string;

  @Field({ nullable: true })
  participants_limit?: number;

  @Field(() => UserType)      
  creator!: UserType;

  @Field(() => [SubscriptionType], { nullable: true })  
  subscriptions?: SubscriptionType[];
}
