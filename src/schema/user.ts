import { ObjectType, Field, ID } from "type-graphql";
import { User } from "@prisma/client";

@ObjectType()
export class UserType implements Partial<User> {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}