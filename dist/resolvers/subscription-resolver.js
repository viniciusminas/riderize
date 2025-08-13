"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionResolver = void 0;
const type_graphql_1 = require("type-graphql");
const subscription_1 = require("../schema/subscription");
const class_validator_1 = require("class-validator");
const type_graphql_2 = require("type-graphql");
let SubscribeToRideInput = class SubscribeToRideInput {
};
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubscribeToRideInput.prototype, "rideId", void 0);
SubscribeToRideInput = __decorate([
    (0, type_graphql_2.InputType)()
], SubscribeToRideInput);
let SubscriptionResolver = class SubscriptionResolver {
    async mySubscriptions({ prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
    async subscribeToRide({ rideId }, { prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
    async unsubscribeFromRide(rideId, { prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
};
exports.SubscriptionResolver = SubscriptionResolver;
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [subscription_1.SubscriptionType]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "mySubscriptions", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => subscription_1.SubscriptionType),
    __param(0, (0, type_graphql_1.Arg)("data")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubscribeToRideInput, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "subscribeToRide", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("rideId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionResolver.prototype, "unsubscribeFromRide", null);
exports.SubscriptionResolver = SubscriptionResolver = __decorate([
    (0, type_graphql_1.Resolver)(subscription_1.SubscriptionType)
], SubscriptionResolver);
