import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
};

export default config;
