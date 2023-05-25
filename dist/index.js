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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const userService_1 = require("./services/userService");
const authService_1 = require("./services/authService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = require("http-errors");
const cors_1 = __importDefault(require("cors"));
const tableService_1 = require("./services/tableService");
const orderService_1 = require("./services/orderService");
const config_1 = __importDefault(require("./config"));
dotenv_1.default.config({ path: ".env" });
const app = (0, express_1.default)();
const port = config_1.default.PORT;
// request logger
app.use((req, _res, next) => {
    console.info(`${req.method} request to "${req.url}" by ${req.hostname}`);
    next();
});
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
app.post("/auth/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const loginResult = yield (0, authService_1.register)(body);
        res.status(200).json(loginResult);
    }
    catch (e) {
        next(e);
    }
}));
app.post("/auth/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        console.log(body);
        const loginResult = yield (0, authService_1.login)(body);
        res.status(200).json(loginResult);
    }
    catch (e) {
        next(e);
    }
}));
// authorization
app.use((req, res, next) => {
    if (!req.headers.authorization) {
        throw new http_errors_1.Forbidden("No credentials were sent");
    }
    jsonwebtoken_1.default.verify(req.headers.authorization, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            throw new http_errors_1.Unauthorized("Invalid credentials");
        }
        next();
    });
    // next();
});
// protected routes
app.get("/users", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, userService_1.getUsers)();
        res.status(200).json(users);
    }
    catch (e) {
        next(e);
    }
    // next(new Error("he"));
    // res.status(200).json(users);
}));
app.get("/orders", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield (0, orderService_1.getOrders)();
        res.status(200).json(orders);
    }
    catch (e) {
        next(e);
    }
    // next(new Error("he"));
    // res.status(200).json(users);
}));
app.get("/tables", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, tableService_1.getTables)();
        res.status(200).json(users);
    }
    catch (e) {
        next(e);
    }
}));
app.get("/tables/:name", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.params.name;
        const schema = yield (0, tableService_1.getTableSchema)(name);
        const data = yield (0, tableService_1.getTableData)(name);
        res.status(200).json({ schema: schema, data: data });
    }
    catch (e) {
        next(e);
    }
}));
app.put("/tables/:name", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.params.name;
        const body = req.body;
        yield (0, tableService_1.insertIntoTable)(name, body);
        res.status(200).json({ success: true });
    }
    catch (e) {
        next(e);
    }
}));
app.delete("/tables/:name/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.params.name;
        const id = req.params.id;
        yield (0, tableService_1.deleteFromTable)(name, id);
        res.status(200).json({ success: true });
    }
    catch (e) {
        next(e);
    }
}));
// error handler
app.use((error, request, response, next) => {
    const status = error.status || 400;
    console.log("hereeee");
    console.log(status);
    response.status(status).send({ message: error.message });
});
