import redis from "redis";
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});
client.on("error", (error) => {
  console.log("Redis Error");
});

async function redisDataStructure() {
  try {
     await client.connect()
    //string -> SET,GET,MSET,MGET
    await client.set("user:name", "Bilal Ali");
    const name = await client.get("user:name");
    console.log(name);
    await client.mSet([
      "user:email",
      "Bilalwdev26@gmail.com",
      "user:age",
      "22",
    ]);
    //destructure 
    const [email, age] = await client.mGet(["user:email", "user:age"]);
    console.log("Email : ", email, "  Age : ", age);
    console.log("Client connect successfully");
    await client.hSet("product1",{
        name:"Nike shoes",
        desc:"Best quality",
        price:100
    })
    const getProducts = await client.hGetAll("product1")
    console.log(getProducts)
  } catch (error) {
    console.log(error);
  } finally {
    //quit connection
    await client.quit();
  }
}

redisDataStructure();
