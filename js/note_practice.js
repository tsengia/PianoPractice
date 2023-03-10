/**
	Note Practice
	Displays a random note for the user to play and then selects a new random note.
*/

var app = new Vue({
	el: "#content",
	data: {
		instructions: "Play the note below",
		hint: "This is the hint text",
		showHint: false,
		loaded: false,
		currentNote: 0,
		showSuccess: false,
		showFail: false,
		noteRange: "D3-C5"
	},
	watch: {
		currentNote: function(newVal, oldVal) {
			ABCJS.renderAbc("music-page", newVal.toABC(), { scale: 3 });
		},
		noteRange: function(newVal, oldVal) {
			currentNote = randomNote(newVal);
		}
	}

});
app.currentNote = new Note("C", 4, "2", false);

window.onload = function () {	
	keysDown = {};
		Object.keys(keymap).forEach(function(k,j) {
		keysDown[k] = false;
	});

	app.hint = "Loading...";
	app.showHint = true;
	MIDI.loadPlugin({
		soundfontUrl: "./soundfonts/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			console.log(state, progress);
		},
		onsuccess: function() {
			console.log("Soundfont loaded");
			MIDI.setVolume(0, 200);
			app.loaded = true;
			app.showHint = false;
		}
	});
};

function randomNote(range="") {
	var note;
	var o = 7;
	var n = "E";

	if(range == "") {
		range = app.noteRange;
	}
	var upperLimit = MIDI.keyToNote[app.noteRange.split("-")[1]];
	var lowerLimit = MIDI.keyToNote[app.noteRange.split("-")[0]];

	// Select a note that we can play on the computer keyboard
	do {
		o = Math.round(Math.random()) + 3;
		n = Note.notesList[Math.floor(Math.random() * Note.notesList.length)];
		note = new Note(n, o, "2", false);
	} while (note.toMIDI() > upperLimit || note.toMIDI() < lowerLimit)

	console.log("new one");
	return note;
}

window.onkeydown = function(e) {
	e.preventDefault();
	if(e.key in keymap) {
		var m = MIDI.keyToNote[keymap[e.key]];
		if(!keysDown[m]) {
			MIDI.noteOn(0, m, 127, 0);
			keysDown[m] = true;
			app.hint = keymap[e.key];
			app.showHint = true;
			if(app.currentNote.sameNote(Note.getNote(keymap[e.key]))) {
				app.showFail = false;
				app.showSuccess = true;
				setTimeout(() => { app.currentNote = randomNote(); app.showSuccess = false; }, 250);
			}
			else {
				app.showFail = true;
			}

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
			app.showHint = false;
		}
	}
};
