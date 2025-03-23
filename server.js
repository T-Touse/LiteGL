import { serve } from "bun";

const server = Bun.serve({
	port: 3000,
	fetch(req) {
		const url = new URL(req.url);

		// return index.html for root path
		if (url.pathname === "/")
			return new Response(Bun.file("index.html"), {
				headers: {
					"Content-Type": "text/html",
				},
			});

		return new Response("Not Found", { status: 404 });
	},
});

console.log(`🚀 Serveur lancé sur http://localhost:${server.port}`);
