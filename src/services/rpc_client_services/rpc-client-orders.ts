import path from 'path';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { RpcRequestServiceAbstract } from './rpc-client-abstract';
import { IGrpcClientRequest } from 'src/interfaces/grpc-client.interface';
import { request } from 'http';

export class OrdersClientService extends RpcRequestServiceAbstract {

  constructor() {
    super();
    // Define the path to the proto file
    this.serviceHost = process.env.ORDER_RPC_HOST || '0.0.0.0:5001';
    this.serviceProtoPath = path.join(process.cwd(), '../ecom-protos-grpc/orders/orders.proto');

    // Load the proto file
    const customerPackageDefinition = ProtoLoader.loadSync(this.serviceProtoPath);
    const customerProto = GRPC.loadPackageDefinition(customerPackageDefinition).Customer as any;

    // Create the service stub
    this.serviceClientCall = new customerProto.CustomerService(this.serviceHost, GRPC.credentials.createInsecure());
  }

  clientRequest(call: IGrpcClientRequest, callback: any) {
    console.log('--> RPC OrderRequest..', call)
    this.serviceClientCall[call.method]({ ...call.message}, (err: any, response: any) => {
      console.log('--> RPC OrderResponse..', response, err)
      if (err) {
        console.log('Error', err);
        callback(err);
      }
      else {
        callback(null, response);
      }
    });
  }

  clientOrder() { }
}