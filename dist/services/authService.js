"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const dbPool_1 = require("../pools/dbPool");
const http_errors_1 = require("http-errors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const register = (registerUserDTO) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: input validation
    // hash password
    const passwordHash = yield bcryptjs_1.default.hash(registerUserDTO.password, 8);
    yield dbPool_1.pool.query(`INSERT INTO users (email, password, firstname, lastname)
    VALUES ('${registerUserDTO.email}', '${passwordHash}', '${registerUserDTO.firstname}', '${registerUserDTO.lastname}')`);
    return { success: true };
});
exports.register = register;
const login = (loginUserDTO) => __awaiter(void 0, void 0, void 0, function* () {
    if (!loginUserDTO.email || !loginUserDTO.password) {
        throw new http_errors_1.UnprocessableEntity("Please include an email and password");
    }
    console.log("HELLOOOOOO");
    console.log(dbPool_1.pool);
    const queryResult = yield dbPool_1.pool.query(`SELECT * FROM users WHERE email = '${loginUserDTO.email}'`);
    console.log(queryResult);
    if (queryResult.rows.length > 0) {
        const user = queryResult.rows[0];
        const doesPasswordMatch = yield bcryptjs_1.default.compare(loginUserDTO.password, user.password);
        if (doesPasswordMatch) {
            // TODO: Add expiration to token
            const token = jsonwebtoken_1.default.sign(user, config_1.default.JWT_SECRET);
            return { token: token };
        }
        else {
            throw new http_errors_1.Unauthorized("Invalid credentials");
        }
    }
    else {
        throw new http_errors_1.Unauthorized("Invalid credentials");
    }
});
exports.login = login;
