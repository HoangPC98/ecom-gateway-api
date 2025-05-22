import client, { Connection, Channel, ConsumeMessage } from "amqplib";
// import { SmsServive } from "./sms/send-sms.service";
import { rabbitmqUri } from "../../config/app.config";

export class RmqPubService {
  private sendSMSQueue = 'QUEUE_SEND_SMS';
  private sendEmailQueue = 'QUEUE_SEND_MAIL';
  private pushNotificationQueue = 'QUEUE_PUSH_NOTIF';
  private channel!: Channel;
  public readonly DIRECT_EXCH = 'direct_exchange';
  public readonly RK_SMS_01 = 'rk_sms_01'
  // private readonly smsService: SmsServive;

  constructor() {
    this.init();
  }

  async init() {
    // Establish connection to RabbitMQ server
    const connection = await client.connect(rabbitmqUri());
    this.channel = await connection.createChannel();
    this.channel.assertExchange(this.DIRECT_EXCH, 'direct', {
      durable: false
    });
    this.assertQueues([
      this.sendSMSQueue,
      // this.sendEmailQueue,
      this.pushNotificationQueue
    ])
  }

  async assertQueues(queues: string[]) {
    await Promise.all(queues.map(queue => {
      this.channel.assertQueue(queue, { durable: true })
    }))
    console.log(`--> Assert Queue... \n + ${queues.join('\n + ')}`)

  }

  publishSMS(rkey: string, msg: any) {
    this.channel.publish(this.DIRECT_EXCH, this.RK_SMS_01,  Buffer.from(JSON.stringify(msg)))
  }
}