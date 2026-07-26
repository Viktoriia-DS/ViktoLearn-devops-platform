from app.redis_client import client

client.set("message", "Hello Redis!")
print(client.get("message"))
