import asyncio
import datetime
import random
import websockets
import json
import test
import opencv_python_object_detection_3 as video



async def show_time(websocket):
    
    while websocket.open:
        #await websocket.send(datetime.datetime.utcnow().isoformat() + "Z")
        #await asyncio.sleep(random.random() * 2 + 1)
        await websocket.send(json.dumps(video.coords))
        await asyncio.sleep(1)

async def main():    
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, startCamera)
    async with websockets.serve(show_time, "localhost", 5678):
        await asyncio.Future()  # run forever    

def startCamera():
    video.run()

if __name__ == "__main__":
    asyncio.run(main())

    