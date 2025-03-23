import { Camera } from "./camera"
import { Scene } from "./scene"

export class WebGLCanvas{
	static HALF_FLOAT_OES = 0x8D61;
	
	#gl: WebGL2RenderingContext
	#canvas: HTMLCanvasElement
	get domElement(){return this.#canvas}

	constructor(options){
		options.canvas ??= document.createElement('canvas')
		options.canvas.width = (options.width??options.canvas.width)||800
		options.canvas.height = (options.height??options.canvas.height)||600
		const canvas = options.canvas
		let gl;
		try{gl = canvas.getContext('webgl',options)}catch(e){console.warn(e)}
		try { gl = gl || canvas.getContext('experimental-webgl', options); } catch (e) {}
		if (!gl) throw new Error('WebGL not supported');
		this.#gl = gl;
		this.#canvas = canvas

		this.resize()
	}
	fullscreen(options: Record<any,any> = {}){

		var top = options.paddingTop || 0;
		var left = options.paddingLeft || 0;
		var right = options.paddingRight || 0;
		var bottom = options.paddingBottom || 0;

		if(!this.#canvas.parentElement){
			if (!document.body) {
				throw new Error('document.body doesn\'t exist yet (call gl.fullscreen() from ' +
				'window.onload() or from inside the <body> tag)');
			}
			document.body.appendChild(this.#canvas);
		}
		const resize = ()=>{
			const w = window.innerWidth - left - right;
			const h = window.innerHeight - top - bottom;
			this.resize(w,h)
		}
		window.addEventListener('resize',resize)
		resize()
	}
	resize(width = this.#canvas.width,height = this.#canvas.height){
		if(width)
			this.#canvas.width = width
		if(height)
			this.#canvas.height = height
		width = this.#canvas.width
		height = this.#canvas.height
		this.#gl.viewport(0,0,width,height)
	}
	#camera(camera: Camera){

	}
	#drawScene(scene: Scene){

	}
	render(camera: Camera,scene: Scene){
		this.#camera(camera)
		this.#drawScene(scene)
	}
}