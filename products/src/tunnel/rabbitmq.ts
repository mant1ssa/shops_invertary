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
    
            const sent = this.channel.sendToQueue("product_events", Buffer.from(JSON.stringify(event)), {
                persistent: true,
            });
    
            if (!sent) {
                console.error("Сообщение не было отправлено.");
            } else {
                console.log("Сообщение успешно отправлено:", event);
            }
        } catch (e) {
            console.error("Ошибка при отправке сообщения в RabbitMQ:", e);
            throw new ApiResponse(500, "Ошибка на этапе отправки сообщения в RabbitMQ", { error: e });
        }
    }
}