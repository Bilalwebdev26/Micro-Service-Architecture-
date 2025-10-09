import amqp from "amqplib";
import { logger } from "./logger.js";

//create connection and channel
let connection = null;
let channel = null;
const EXCHANGE_NAME = "facebook_events"; //unique exchange name

export async function RabbitMQconnection() {
  try {
    logger.info("Exchange connection start...");
    //connection
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    //connect with channel
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connecting to RabbitMQ successfully...");
    return channel;
  } catch (error) {
    logger.warn(`Error while connecting rabbitMQ : ${error}`)
  }
}

export async function publishEvent(routingKey,message) {
  if(!channel){
    await RabbitMQconnection()
  }
  channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)))
  logger.info(`Event Published : ${routingKey}`)
}

//media ke liye rabbitmq set kerna 