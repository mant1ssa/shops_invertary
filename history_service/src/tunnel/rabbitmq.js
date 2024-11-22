import amqp from 'amqplib';

export default class RabbitMQ {
  static channel;

  static async init() {
    const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672/");
    this.channel = await connection.createChannel();
    await this.channel.assertQueue("product_events", { durable: true });
    console.log("RabbitMQ создан и инициализирован");
  }

  static async consume(callback) {
    if (!this.channel) {
      throw new Error("RabbitMQ не инициализирован");
    }
    this.channel.consume(
      "product_events",
      async (message) => {
        if (message !== null) {
          try {
            const content = JSON.parse(message.content.toString());
            await callback(content);
            this.channel.ack(message);
          } catch (err) {
            console.error("Ошибка:", err);
            this.channel.nack(message, false, false);
          }
        }
      },
      { noAck: false }
    );
  }
}
