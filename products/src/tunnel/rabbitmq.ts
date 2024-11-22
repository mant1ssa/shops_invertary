import { ApiResponse } from '../response';
import amqp from 'amqplib';

export default class RabbitMQ {
    private static channel: amqp.Channel | undefined;

    static async init() {
        const connection = await amqp.connect("amqp://guest:guest@rabbitmq:5672");
        this.channel = await connection.createChannel();
        await this.channel.assertQueue("product_events", { durable: true });
    }

    static async publish(event: any) {
        try {
            if (!this.channel) {
                console.error("RabbitMQ канал не инициализирован.");
                throw new ApiResponse(500, "RabbitMQ не инициализирован", { error: event });
            }
        } catch(e) {
            console.log(e)
            throw new ApiResponse(500, "Ошибка на этапе запуска RabbitMQ", { error: e });
        }
    }
}