module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "12345678",
    PORT: 5432,
    DB: "primer_final",
    dialect: "postgres",

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
