import path from 'path';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { RpcRequestServiceAbstract } from './rpc-client-abstract';
import { IGrpcClientRequest } from 'src/interfaces/grpc-client.interface';
import logger from "src/utils/logger";


export class CustomerClientService extends RpcRequestServiceAbstract {
  public authServiceCall: any;
  public authServiceProtoPath: string = '';
  constructor() {
    super();
    // Define the path to the proto file
    this.serviceHost = '0.0.0.0:5001';
    this.serviceProtoPath = process.env.APP_ENV == 'local' 
    ? path.join(process.cwd(), '../ecom-protos-grpc/customer/customer.proto') 
    : path.join(process.cwd(), './proto/customer/customer.proto');
    // Load the proto file
    const customerPackageDefinition = ProtoLoader.loadSync(this.serviceProtoPath);
    const customerProto = GRPC.loadPackageDefinition(customerPackageDefinition).Customer as any;

    // Create the service stub
    this.serviceClientCall = new customerProto.CustomerService(this.serviceHost, GRPC.credentials.createInsecure());
  }

  clientRequest<T>(call: IGrpcClientRequest, callback: any) {
    logger.info('--> ClientRequest', call)
    this.serviceClientCall[call.method]({ ...call.message}, (err: any, response: T) => {
      logger.info('--> Response', response, err)
      if (err) {
        console.error(`--> An Error Occur: \n [Code]: ${err.code}  \n [Detail]: ${err.details}`);
        callback(err);
      }
      else {
        callback(null, response);
      }
    });
  }

  clientOrder() { }
}