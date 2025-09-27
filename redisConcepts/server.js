import redis from "redis"
const client = redis.createClient({
    host:'localhost',
    port:6379
})
client.on('error',(error)=>{
    console.log("Redis Error")
})

async function testRedisConnection() {
    try {
        await client.connect()
        console.log("Client connect successfully")
    } catch (error) {
        console.log(error)
    } finally{
        //quit connection
        await client.quit()
    }
}

testRedisConnection()