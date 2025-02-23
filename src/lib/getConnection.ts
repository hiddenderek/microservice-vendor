import debug from 'debug';
import { Pool, PoolConfig } from 'pg';

export async function getConnection(database: string) {
    const host = process.env.DB_HOST;
    const password = process.env.DB_PASSWORD;
    const port = process.env.DB_PORT;
    const userId = process.env.DB_USERID;

    const config: PoolConfig = {
        database,
        user: userId,
        password,
        max: parseInt(process.env.DB_POOL_MAX ?? '3', 10),
        host,
        port: port ? parseInt(port, 10) : 1337,
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT ?? '300', 10),
    };

    const pool = new Pool(config);
    const poolClient = await pool.connect();
    return { pool, poolClient };
}
