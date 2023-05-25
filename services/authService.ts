import { pool } from "../pools/dbPool";
import { Unauthorized, UnprocessableEntity } from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginUserDTO, RegisterUserDTO } from "../interfaces/user";
import config from "../config";

export const register = async (registerUserDTO: RegisterUserDTO) => {
  // TODO: input validation

  // hash password
  const passwordHash = await bcrypt.hash(registerUserDTO.password, 8);

  await pool.query(
    `INSERT INTO users (email, password, firstname, lastname)
    VALUES ('${registerUserDTO.email}', '${passwordHash}', '${registerUserDTO.firstname}', '${registerUserDTO.lastname}')`
  );

  return { success: true };
};

export const login = async (loginUserDTO: LoginUserDTO) => {
  if (!loginUserDTO.email || !loginUserDTO.password) {
    throw new UnprocessableEntity("Please include an email and password");
  }
  const queryResult = await pool.query(
    `SELECT * FROM users WHERE email = '${loginUserDTO.email}'`
  );

  if (queryResult.rows.length > 0) {
    const user = queryResult.rows[0];

    const doesPasswordMatch = await bcrypt.compare(
      loginUserDTO.password,
      user.password
    );

    if (doesPasswordMatch) {
      // TODO: Add expiration to token
      const token = jwt.sign(user, config.JWT_SECRET as string);
      return { token: token };
    } else {
      throw new Unauthorized("Invalid credentials");
    }
  } else {
    throw new Unauthorized("Invalid credentials");
  }
};
