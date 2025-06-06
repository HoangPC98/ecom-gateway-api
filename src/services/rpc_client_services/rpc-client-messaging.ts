import path from 'path';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { RpcRequestServiceAbstract } from './rpc-client-abstract';
import { IGrpcClientRequest } from 'src/interfaces/grpc-client.interface';
import { request } from 'http';

export class MessagingClientService extends RpcRequestServiceAbstract {

  constructor() {
    super();
    // Define the path to the proto file
    this.serviceHost = '0.0.0.0:9001';
    this.serviceProtoPath = path.join(process.cwd(), '../ecom-protos-grpc/messaging/messaging.proto');

    // Load the proto file
    const messagingPackageDefinition = ProtoLoader.loadSync(this.serviceProtoPath);
    const messagingProto = GRPC.loadPackageDefinition(messagingPackageDefinition).Messaging as any;

    // Create the service stub
    this.serviceClientCall = new messagingProto.MessagingService(this.serviceHost, GRPC.credentials.createInsecure());
  }

  clientRequest(call: IGrpcClientRequest, callback: any) {
    console.log('--> RPC MessagingRequest..', call)
    this.serviceClientCall[call.method]({ ...call.message}, (err: any, response: any) => {
      console.log('--> RPC MessagingResponse..', response, err)
      if (err) {
        console.log('Error', err);
        callback(err);
      }
      else {
        callback(null, response);
      }
    });
  }

  clientmessaging() { }
}