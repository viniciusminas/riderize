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
exports.RideResolver = void 0;
const type_graphql_1 = require("type-graphql");
const class_validator_1 = require("class-validator");
const type_graphql_2 = require("type-graphql");
const ride_1 = require("../schema/ride");
const subscription_1 = require("../schema/subscription");
let CreateRideInput = class CreateRideInput {
};
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 50, { message: "O nome deve ter entre 3 e 50 caracteres" }),
    __metadata("design:type", String)
], CreateRideInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsDate)({ message: "Data de início inválida" }),
    __metadata("design:type", Date)
], CreateRideInput.prototype, "start_date", void 0);
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsDate)({ message: "Data de início das inscrições inválida" }),
    __metadata("design:type", Date)
], CreateRideInput.prototype, "start_date_registration", void 0);
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsDate)({ message: "Data de término das inscrições inválida" }),
    __metadata("design:type", Date)
], CreateRideInput.prototype, "end_date_registration", void 0);
__decorate([
    (0, type_graphql_2.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRideInput.prototype, "additional_information", void 0);
__decorate([
    (0, type_graphql_2.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRideInput.prototype, "start_place", void 0);
__decorate([
    (0, type_graphql_2.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "O limite deve ser pelo menos 1" }),
    __metadata("design:type", Number)
], CreateRideInput.prototype, "participants_limit", void 0);
CreateRideInput = __decorate([
    (0, type_graphql_2.InputType)()
], CreateRideInput);
let RideResolver = class RideResolver {
    async rides({ prisma }) {
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
    async myRides({ prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
    async createRide(data, { prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
    async subscribeToRide(rideId, { prisma, user }) {
        if (!user)
            throw new Error("Usuário não autenticado");
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
};
exports.RideResolver = RideResolver;
__decorate([
    (0, type_graphql_1.Query)(() => [ride_1.RideType]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RideResolver.prototype, "rides", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Query)(() => [ride_1.RideType]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RideResolver.prototype, "myRides", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => ride_1.RideType),
    __param(0, (0, type_graphql_1.Arg)("data")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRideInput, Object]),
    __metadata("design:returntype", Promise)
], RideResolver.prototype, "createRide", null);
__decorate([
    (0, type_graphql_1.Authorized)(),
    (0, type_graphql_1.Mutation)(() => subscription_1.SubscriptionType),
    __param(0, (0, type_graphql_1.Arg)("rideId")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RideResolver.prototype, "subscribeToRide", null);
exports.RideResolver = RideResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], RideResolver);
