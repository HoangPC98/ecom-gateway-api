import path from 'path';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { RpcRequestServiceAbstract } from './rpc-client-abstract';
import { IGrpcClientRequest } from 'src/interfaces/grpc-client.interface';
import { request } from 'http';

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

    //
    // this.authServiceProtoPath = path.join(process.cwd(), '../ecom-protos-grpc/customer/customer.auth.proto');
    // const authPackageDefinition = ProtoLoader.loadSync(this.authServiceProtoPath);
    // const authProto = GRPC.loadPackageDefinition(authPackageDefinition).CustomerAuth as any;
    // this.authServiceCall = new authProto.CustomerAuthService(this.serviceHost, GRPC.credentials.createInsecure());
  }

  clientRequest<T>(call: IGrpcClientRequest, callback: GRPC.sendUnaryData<T>) {
    console.log('--> ClientRequest', call)
    this.serviceClientCall[call.method]({ ...call.message}, (err: any, response: T) => {
      console.log('--> Response', response, err)
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