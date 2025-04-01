import client, { Connection, Channel, ConsumeMessage } from "amqplib";
// import { SmsServive } from "./sms/send-sms.service";
import { rabbitmqUri } from "../../config/app.config";

export class RmqPubService {
  private sendSMSQueue = 'QUEUE_SEND_SMS';
  private sendEmailQueue = 'QUEUE_SEND_MAIL';
  private pushNotificationQueue = 'QUEUE_PUSH_NOTIF';
  private connection!: Connection;
  private channel!: Channel;
  public readonly DIRECT_EXCH = 'direct_exchange';
  // private readonly smsService: SmsServive;

  constructor() {
    this.init();
    // this.smsService = new SmsServive();
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
      this.sendEmailQueue,
      this.pushNotificationQueue
    ])
  }

  async consumeQueueBName(queueName: string) {
    await this.channel.assertQueue(this.sendSMSQueue, { durable: true });
    this.channel.consume(this.sendSMSQueue, async (msg) => {
      if (msg) {
        console.log(`Consume Msg from Queue: ${this.sendEmailQueue}`, msg?.content.toString())
        // Acknowledge the processed message
        this.channel.ack(msg);
      }
    })
  }

  async assertQueues(queues: string[]) {
    await Promise.all(queues.map(queue => {
      this.channel.assertQueue(queue, { durable: true })
    }))
    console.log(`--> Assert Queue... \n + ${queues.join('\n + ')}`)

  }

  publishSMS(rkey: string, msg: any) {
    this.channel.assertQueue(this.sendSMSQueue, { durable: true });
    // this.channel.publish(this.DIRECT_EXCH, rkey,  Buffer.from(JSON.stringify({ msg })))
    this.channel.sendToQueue(this.sendSMSQueue, Buffer.from(JSON.stringify(msg)))
  }
}