import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { getUsers } from "./services/userService";
import { login, register } from "./services/authService";
import { HttpError } from "http-errors";
import { LoginUserDTO, RegisterUserDTO } from "./interfaces/user";
import jwt from "jsonwebtoken";
import { Unauthorized, Forbidden } from "http-errors";
import cors from "cors";
import {
  deleteFromTable,
  getTableData,
  getTableSchema,
  getTables,
  insertIntoTable,
} from "./services/tableService";
import { getOrders } from "./services/orderService";
import config from "./config";

dotenv.config({ path: ".env" });

const app: Express = express();
const port = config.PORT;

// request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.info(`${req.method} request to "${req.url}" by ${req.hostname}`);
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(cors());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post(
  "/auth/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as RegisterUserDTO;
      const loginResult = await register(body);
      res.status(200).json(loginResult);
    } catch (e: any) {
      next(e);
    }
  }
);

app.post(
  "/auth/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as LoginUserDTO;
      console.log(body);
      const loginResult = await login(body);
      res.status(200).json(loginResult);
    } catch (e: any) {
      next(e);
    }
  }
);

// authorization
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    throw new Forbidden("No credentials were sent");
  }

  jwt.verify(
    req.headers.authorization,
    process.env.JWT_SECRET as string,
    (err, decoded) => {
      if (err) {
        throw new Unauthorized("Invalid credentials");
      }
      next();
    }
  );
  // next();
});

// protected routes
app.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
  // next(new Error("he"));
  // res.status(200).json(users);
});
app.get("/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getOrders();
    res.status(200).json(orders);
  } catch (e) {
    next(e);
  }
  // next(new Error("he"));
  // res.status(200).json(users);
});

app.get("/tables", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getTables();
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
});

app.get(
  "/tables/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.params.name as string;
      const schema = await getTableSchema(name);
      const data = await getTableData(name);

      res.status(200).json({ schema: schema, data: data });
    } catch (e) {
      next(e);
    }
  }
);

app.put(
  "/tables/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.params.name as string;
      const body = req.body;
      await insertIntoTable(name, body);

      res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

app.delete(
  "/tables/:name/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.params.name as string;
      const id = req.params.id as string;
      await deleteFromTable(name, id);

      res.status(200).json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

// error handler
app.use(
  (
    error: HttpError,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const status = error.status || 400;
    console.log("hereeee");
    console.log(status);
    response.status(status).send({ message: error.message });
  }
);
