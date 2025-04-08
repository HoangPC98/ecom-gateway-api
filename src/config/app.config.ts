import { config } from "dotenv";
const configFile = `./.env`;
config({ path: configFile });

const { MONGO_URI, PORT, JWT_SECRET, NODE_ENV, RABBITMQ_URI } = process.env;

export const rabbitmqUri = (): string => {
    const user = process.env.RABBITMQ_DEFAULT_USER;
    const pass = process.env.RABBITMQ_DEFAULT_PASS;
    const host = process.env.RABBITMQ_HOST;
    const port = process.env.RABBITMQ_PORT;
    return `amqp://${user}:${pass}@${host}:${port}`;
};

export default {
    MONGO_URI,
    APP_PORT: process.env.APP_PORT,
    JWT_SECRET,
    env: NODE_ENV,
    msgBrokerURL: rabbitmqUri(),
};