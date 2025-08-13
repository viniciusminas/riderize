import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { MyContext } from "../utils/types";
import { RegisterInput, LoginInput } from "../inputs/user-inputs";
import { hash, verify } from "argon2";
import jwt from 'jsonwebtoken';
import { UserType } from "../schema/user";

@Resolver()
export class UserResolver {
  @Query(() => UserType, { nullable: true })
  async me(@Ctx() { prisma, user }: MyContext) {
    if (!user) return null;
    return prisma.user.findUnique({ 
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

@Query(() => [UserType])
async users(@Ctx() { prisma }: MyContext) {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  });
}


  @Mutation(() => String)
  async login(
    @Arg("data") { email, password }: LoginInput,
    @Ctx() { prisma }: MyContext
  ) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    
    const valid = await verify(user.password, password);
    if (!valid) throw new Error("Invalid password");

    return jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );
  }

  @Mutation(() => UserType)
  async createUser(
    @Arg("data") { name, email, password }: RegisterInput,
    @Ctx() { prisma }: MyContext
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await hash(password);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }
}
