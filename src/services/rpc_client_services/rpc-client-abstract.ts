import path from 'path';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import { IGrpcClientRequest } from 'src/interfaces/grpc-client.interface';

export abstract class RpcRequestServiceAbstract {
  // Define the service you want to call
  public serviceProtoPath: string = '';
  public serviceHost: string = '';
  public serviceClientCall: any;
  abstract clientRequest(call: IGrpcClientRequest, callback: GRPC.sendUnaryData<any>): void;

}