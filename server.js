import index from "./example/index.html"
const TS = Bun.Transpiler({loader: "ts"});

const server = Bun.serve({
	port: 3000, // Port du serveur
	routes: {
		"/*":index,
		"/favicon.ico": new Response("404 Not Found", { status: 404 }),

		"/src/*": async (req) => {
			const url = new URL(req.url);
			// Supprime le préfixe "/src/"
			let path = url.pathname.replace("/src/", "/");
			// Si c'est un fichier TypeScript, le transpiler
			if (!path.endsWith(".ts")) {
				path += ".ts";
			}
			try {
				// Essaie de lire le fichier TypeScript
				const content = await Bun.file("./src/" + path).text();
				// Appliquer la transpilation TypeScript
				const transpiled = TS.transformSync(content);
				// Retourner le contenu transformé
				return new Response(transpiled, {
					headers: {
						"Content-Type": "application/javascript",
					},
				});
			} catch (e) {
				console.error(e)
				// Si le fichier n'existe pas, retourne une erreur 404
				return new Response("404 Not Found", { status: 404 });
			}
		},
	},
	fetch(req) {
		const url = new URL(req.url);
		let path = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname;
		try {
			// Retourner le fichier demandé
			return new Response(Bun.file("." + path));
		} catch (e) {
			// Si le fichier n'existe pas, retourne une erreur 404
			return new Response("404 Not Found", { status: 404 });
		}
	},
});

console.log(`🚀 Serveur lancé sur http://localhost:${server.port}`);
