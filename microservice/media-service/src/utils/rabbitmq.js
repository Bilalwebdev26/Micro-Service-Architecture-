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


export async function consumeEvent(routingKey,callback) {
   if(!channel){
    await RabbitMQconnection()
  }
  // create queue
  const q = await channel.assertQueue("",{exclusive:true})
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
  channel.consume(q.queue,(msg)=>{
    //publish -> stringify
    //consume -> parse
   if(msg !== null){
     const content = JSON.parse(msg.content.toString())
     callback(content)
     channel.ack(msg)
   }
  })
  logger.info(`Subscribed to event : ${routingKey}`)
}