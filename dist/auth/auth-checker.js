"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authChecker = void 0;
const authChecker = ({ context }, roles) => {
    if (!context.user)
        return false;
    if (roles.length === 0)
        return true;
    // Adapte conforme sua lógica de roles:
    return roles.some(role => context.user.roles?.includes(role));
};
exports.authChecker = authChecker;
