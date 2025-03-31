export class Object3D extends EventTarget{
	#uuid = crypto.randomUUID();
	#parent:Object3D|null = null;
	get parent(){return this.#parent}
	#children:Set<Object3D> = new Set();
	get children(){return this.#children}
	constructor(){
		super()
	}
	add(object:Object3D){
		this.#children.add(object)
	}
	delete(object:Object3D){
		this.#children.delete(object)
	}
}