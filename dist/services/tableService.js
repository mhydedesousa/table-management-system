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
exports.insertIntoTable = exports.deleteFromTable = exports.getTableData = exports.getTableSchema = exports.getTables = void 0;
const dbPool_1 = require("../pools/dbPool");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getTables = () => __awaiter(void 0, void 0, void 0, function* () {
    // throw new Error("ehllo");
    return (yield dbPool_1.pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)).rows.map((x) => x.table_name);
});
exports.getTables = getTables;
const getTableSchema = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield dbPool_1.pool.query(`SELECT
          cols.column_name,
          cols.data_type,
          cols.is_nullable,
          fk.referenced_table_name,
          fk.referenced_column_name
      FROM
          information_schema.columns AS cols
          LEFT JOIN (
              SELECT
                  conname AS constraint_name,
                  conrelid::regclass::text AS table_name,
                  a.attname AS column_name,
                  confrelid::regclass::text AS referenced_table_name,
                  b.attname AS referenced_column_name
              FROM
                  pg_constraint AS c
                  JOIN pg_attribute AS a ON c.conrelid = a.attrelid AND a.attnum = ANY(c.conkey)
                  JOIN pg_attribute AS b ON c.confrelid = b.attrelid AND b.attnum = ANY(c.confkey)
              WHERE
                  confrelid != 0::oid
                  AND contype = 'f'
          ) AS fk ON cols.table_name = fk.table_name AND cols.column_name = fk.column_name
      WHERE
          cols.table_name = '${name}';`)).rows;
});
exports.getTableSchema = getTableSchema;
const getTableData = (name) => __awaiter(void 0, void 0, void 0, function* () {
    // throw new Error("ehllo");
    return (yield dbPool_1.pool.query(`SELECT * FROM ${name}`)).rows;
});
exports.getTableData = getTableData;
const deleteFromTable = (name, id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield dbPool_1.pool.query(`DELETE FROM ${name} WHERE id='${id}'`);
});
exports.deleteFromTable = deleteFromTable;
const insertIntoTable = (name, body) => __awaiter(void 0, void 0, void 0, function* () {
    const columns = [];
    const values = [];
    for (const key of Object.keys(body)) {
        columns.push(key);
        let val = body[key];
        if (key === "password")
            val = yield bcryptjs_1.default.hash(val, 8);
        values.push(`'${val}'`);
    }
    console.log(columns);
    console.log(values);
    return (yield dbPool_1.pool.query(`INSERT INTO ${name} (${columns.join(", ")}) 
      VALUES (${values.join(", ")})`)).rows;
});
exports.insertIntoTable = insertIntoTable;
