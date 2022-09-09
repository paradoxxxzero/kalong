from aiohttp import web


async def handle(request):
    a = 1
    b = 10
    c = 2
    t = a * b**c
    breakpoint()
    return web.Response(text=f"HELLO {t}")


app = web.Application()
app.add_routes([web.get("/", handle), web.get("/{name}", handle)])

if __name__ == "__main__":
    web.run_app(app, port=9595)
