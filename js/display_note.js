/**
	Display Note.js
	A simple app to display the note that the user plays
*/

var app = new Vue({
	el: "#content",
	data: {
		instructions: "Play the note below",
		hint: "This is the hint text",
		showHint: false,
		loaded: false,
		music: 0
	},
	watch: {
		music: {
			handler: function(newValue, oldValue) {
				ABCJS.renderAbc("music-page", newValue.toABC(), { scale: 2 });
			},
			deep: true
		}
	}

});
app.music = new Measure();
app.music.beats.push(new Note("C", 4, "2", false));

window.onload = function () {
	app.hint = "Loading...";
	app.showHint = true;
	MIDI.loadPlugin({
		soundfontUrl: "./libs/midi-js-soundfonts/MusyngKite/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			MIDI.setVolume(0, 200);
			app.loaded = true;
			app.showHint = false;
		}
	});
};

keysDown = {};
Object.keys(keymap).forEach(function(k,j) {
	keysDown[k] = false;
});

window.onkeydown = function(e) {
	e.preventDefault();
	if(e.key in keymap) {
		var m = MIDI.keyToNote[keymap[e.key]];
		if(!keysDown[m]) {
			MIDI.noteOn(0, m, 127, 0);
			keysDown[m] = true;
		}
	}
};

window.onkeyup = function(e) {
	e.preventDefault();
	if(e.key in keymap) {
		var m = MIDI.keyToNote[keymap[e.key]];
		if (keysDown[m]) {
			MIDI.noteOff(0, MIDI.keyToNote[keymap[e.key]], 0);
			keysDown[m] = false;
		}
	}
};
