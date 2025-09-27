import redis from "redis"
const client = redis.createClient({
    host:'localhost',
    port:6379
})
client.on('error',(error)=>{
    console.log("Redis Error")
})

async function pubsubChannel() {
    try {
        await client.connect()
        console.log("Client connect successfully")
        const subscriber = client.duplicate()
        await subscriber.connect()
        subscriber.subscribe('dummy-channel',(message,channel)=>{
            console.log(`Reciever recive message from ${channel} - message : ${message}`)
        })
        await client.publish('dummy-channel','This is 1st dummy data')
        await client.publish('dummy-channel','This is 2nd dummy data')
         await new Promise((resolve)=>setTimeout(resolve,5000))
        await subscriber.unsubscribe('dummy-channel')
        await subscriber.quit()
    } catch (error) {
        console.log(error)
    } finally{
        //quit connection
        await client.quit()
    }
}

pubsubChannel()