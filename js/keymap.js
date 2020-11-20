
/**
	keymap.js	Author: Tyler Sengia
	Contains the class and Vue component for a configurable piano keymapping.
	
	How this works:
	   You map keys to action names. (using setKey)
	   You can they assign callback functions to action names. (addActionListener)
	   There can be multiple callback functions per action name.
	   Each callback function will be called with the following parameters:
	       callback(string actionName, boolean keyDown)
       
       key -> Action name -> CallbackA & CallbackB & Callback...
       
       Why have action names? 
       This allows you to change the key assigned to the note without rebuilding your callbacks.
       This also allows you to set action listeners without knowing the specific key that is bound to an action.
*/

class PianoKeymap {

	///Registers keydown and keyup event listeners
	apply() {
		if(!this._applied) {
			window.addEventListener("keydown", this._keydownCallback.bind(this));
			window.addEventListener("keyup", this._keyupCallback.bind(this));
			this._applied = true;
		}
	}

	///Unregisters keydown and keyup event listeners
	rollback() {
		if(this._applied) {
			window.removeEventListener("keydown", this._keydownCallback);
			window.removeEventListener("keyup", this._keyupCallback);
			this._applied = false;
		}
	}

	///Either creates a new action/key pair or updates an existing one
	///Returns true if the key conflicts with already existing key/action pairs
	setKey(actionName, keyValue) {
		keyValue = keyValue.charCodeAt(0);
		let j = this.indexOfAction(actionName);
		if(j != -1) {
			this.actions[j].setting = keyValue;
		}
		else {
			this.actions.push({ id: this._actionID, setting: keyValue, actionName: actionName });
			this._actionID++;
		}

		var count = 0;
		for(let i = 0; i < this.actions.length; i++) {
			if(this.actions[i].setting == keyValue) {
				this.count++;
			}
		}
		return count > 1;
	}

	///Removes an action/key pair from the action list
	removeAction(actionName) {
		let i = this.indexOfAction(actionName);
		if(i != -1) {
			this.actions.splice(i, 1);
		}
	}

	addActionListener(actionName, callback) {
		if(actionName in this._callbacks) {
			this._callbacks[actionName].push(callback);
		}
		else {
			this._callbacks[actionName] = [];
			this._callbacks[actionName].push(callback);
		}
	}

	indexOfAction(actionName) {
		for(let i = 0; i < this.actions.length; i++) {
			if(this.actions[i].actionName == actionName) {
				return i;
			}
		}
		return -1;
	}

	_keydownCallback(e) {
		if(this._keysDown.indexOf(e.key.charCodeAt(0)) == -1) {
			this._keysDown.push(e.key.charCodeAt(0));
			for(let p in this.actions) {
				if(this.actions[p].setting == e.key.charCodeAt(0)) {
					e.preventDefault();
					let actionName = this.actions[p].actionName;
					if(actionName in this._callbacks) {
						for(let i = 0; i < this._callbacks[actionName].length; i++) {
							this._callbacks[actionName][i](actionName, true);
						}
					}
				}
			}
		}
	}

	_keyupCallback(e) {
		let i = this._keysDown.indexOf(e.key.charCodeAt(0));
		if(i != -1) {
			delete this._keysDown[i];
		}

		for(let p in this.actions) {
			if(this.actions[p].setting == e.key.charCodeAt(0)) {
				let actionName = this.actions[p].actionName;
				if(actionName in this._callbacks) {
					for(let i = 0; i < this._callbacks[actionName].length; i++) {
						this._callbacks[actionName][i](actionName, false);
					}
				}
			}
		}
	}

	constructor() {
		this._actionID = 0;
		this.actions = [];
		this._callbacks = [];
		this._keysDown = [];
		this._applied = false;
	}
}

Vue.component("keymap-window", {
	props: {
		keymap: Object
	},
	data: function() { return {
		windowOpen: false
	}},
	template: "<span><div class='keymap-window' v-if='windowOpen' >\
	<div class='title-bar' ><button type='button' v-on:click='windowOpen = false' >X</button>Keys</div><div class='window-content'>\
	<keymap-entry v-for='k in keymap.actions' :key='k.id' v-bind:actual='k' v-bind:action-name='k.actionName' v-bind:setting='k.setting' />\
	</div></div><button type='button' v-on:click='windowOpen=true' >Keys</button></span>"
});

// Each key that is bound to a note is known as an entry
Vue.component("keymap-entry", {
	props: {
		actionName: String,
		actual: Object
	},
	data: function () { return {
		editing: false
	}},
	methods: {
		setKey: function() {
			this.editing = true;
			window.addEventListener("keydown", keydownSetListener = (e) => {
				this.setting = e.key.charCodeAt(0);
				this.editing = false;
				window.removeEventListener("keydown", keydownSetListener);
			});
		},
	},
	computed: {
		displayedSetting: function() {
			return String.fromCharCode(this.setting);
		},
		setting: {
			get: function() {
				return this.actual.setting;
			},
			set: function(val) {
				this.actual.setting = val;
			}
		}
	},
	template: "<div v-on:click='setKey' class='keymap-setting' >{{ actionName }} : <span v-if='editing' >-?-</span><span v-if='!editing' >{{ displayedSetting }}</span></div>"
});
