type DbConnection = {
    host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

const connection: DbConnection = {
	host: String(process.env.DB_HOST),
	port: Number(process.env.DB_PORT),
	user: String(process.env.DB_USER),
	password: String(process.env.DB_PASSWORD),
	database: String(process.env.DB_DATABASE)
};

export default connection;