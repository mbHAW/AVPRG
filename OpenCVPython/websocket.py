import asyncio
import websockets
import json
import opencv_python_object_detection_3 as video

async def show_time(websocket):
    
    while websocket.open:
        await websocket.send(json.dumps(video.coords))
        await asyncio.sleep(0.2)

async def main():    
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, startCamera)
    async with websockets.serve(show_time, "localhost", 5678):
        await asyncio.Future()  # run forever    

def startCamera():
    video.run()

if __name__ == "__main__":
    asyncio.run(main())

    