import express, { Express } from "express";
import { Server } from "http";
// import userRouter from "./routes/authRoutes";
import { errorConverter, errorHandler } from "./middleware";
import config from "./config/app.config";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from "path";

let server: Server;
const restServer: Express = express();

function startServer() {
  restServer.use(express.json());
  restServer.use(express.urlencoded({ extended: true }));
  // restServer.use(userRouter);
  restServer.use(errorConverter);
  restServer.use(errorHandler);
  server = restServer.listen(config.APP_PORT, () => {
    console.log(`--> Server is running on port ${config.APP_PORT}`);
  });
}


function intiGrpcConnection() {
  const rpc_port = 50050;
  const packageDefinitionCustomer = protoLoader.loadSync(path.join(__dirname, '../../ecom-protos-grpc/customers/customer.proto'));
  const packageDefinitionHero = protoLoader.loadSync(path.join(__dirname, '../../ecom-protos-grpc/customers/hero.proto'));
  const customerProto = grpc.loadPackageDefinition(packageDefinitionCustomer).Customer as any;
  const heroProto = grpc.loadPackageDefinition(packageDefinitionHero).hero as any;
  const server = new grpc.Server();

  //   server.addService(customerProto.CustomersService.service, { getAllNews: getAllNews });
  //   server.addService(heroProto.HeroService.service, { findOne: findOne });
  // server.addService(customerProto.CustomersService.service, { getAllNews: getAllNews });

  server.bindAsync(
    `localhost:${rpc_port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err != null) {
        return console.error(`Error start application: ${err}`);
      }
      console.warn(`Microservice customers gRPC listening on ${port}`);
    },
  );
};

const bootstrap = async () => {
  startServer();
  intiGrpcConnection();
}

bootstrap();

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);