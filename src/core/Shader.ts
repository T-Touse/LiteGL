export class Shader{
	static OPTIONS = {uniforms:{},vertexShader:"",fragmentShader:"",name:""};
	wireframe = false
	wireframeLineWidth = 1
	#uniforms = {}
	get uniforms(){return this.#uniforms}
	#name = ""
	get name(){return this.#name}
	#vertexShader
	#fragmentShader
	constructor(options = Shader.OPTIONS){
		let {uniforms,vertexShader,fragmentShader,name} = Object.assign({},options,Shader.OPTIONS)
		if(name.length==0)
			name = crypto.randomUUID()
		this.#name = name
		this.#uniforms = uniforms
		this.#vertexShader = vertexShader
		this.#fragmentShader = fragmentShader
	}
}