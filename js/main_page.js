/**
	main_page.js
*/

var app = new Vue({
	el: "#app",
	data: {
		keymapEditorOpen: false,
		keymap: new PianoKeymap(),
		hint: "",
		showHint: false,
		showFail: false,
		showSuccess: false,
		loaded: false,
		abcString: "C",
		abcScale: 1,
		notesOn: [],
		showNotesOn: true,
		contentText: "",
		modes: [ { name: "Free Play", id: 0},
			 { name: "Single Note", id: 1},
			 { name: "Song", id: 2},
			 { name: "Scales", id: 3}],
	    singleNoteRanges: [{ name: "All Notes", id:0 }, 
	    { name: "C4", id:1 }, { name: "B3-D4", id: 2 }, { name: "A3-E4", id: 3 }, { name: "G3-F4", id: 4 }
	    ],
	    selectedNoteRange: 0,
		selectedMode: "1",
		songs: [ { name: "Happy Birthday", id:0 } ],
		selectedSong: "0",
		scales: [ 
		  { name: "C Major", id: 0}, { name: "C Minor", id: 1}
		],
		selectedScale: "0",
		showSongSelection: false,
		boundNotes: [],
		boundNoteRange: null,
		selectedNote: "C4"
	},
	watch: {
		abcString: function(newVal, oldVal) {
			ABCJS.renderAbc("music-page", newVal, { scale: this.abcScale });
		},
		selectedNoteRange: function (newVal, oldVal) {
		    this.displayRandomNote();
		},
		selectedMode: function(newVal, oldVal) {
		    this.showSongSelection = false;
		    if (newVal == "3") {
		        this.showScaleSelection = true;
		        this.showScale(this.selectedScale);
		    }
			else if(newVal == "2") {
				this.showSongSelection = true;
				this.loadSong(this.selectedSong);
			}
			else if (newVal == "1") { // Single Note
			    this.displayRandomNote();
			}
			else if (newVal == "0") { // Free play
			     this.showFail = false;
			     this.showSuccess = false;
			}
		},
		selectedSong: function(newSong, oldSong) {
			this.loadSong(newSong);
		}
	},
	methods: {
        showScale: function (selectedScale) {
            console.log(selectedScale);
            this.selectedNote = Scales[this.scales[selectedScale].name][0];
        },
        displayRandomNote: function () {    
            if (this.selectedNoteRange == 0) {
                this.selectedNote = this.boundNoteRange.getRandomNote();
            }
            else if (this.selectedNoteRange == 1) {
                this.selectedNote = new Note("C", 4);
            }
            else {
                var i = (new Note("C", 4)).getNoteAtDistance(1-this.selectedNoteRange);
                var x = (new Note("C", 4)).getNoteAtDistance(this.selectedNoteRange-1);
                var range = new NoteRange(i,x);
                this.selectedNote = range.getRandomNote();
            }
              
            this.selectedNote.duration = "4";

            var s = "M: 4/4\nK:C\n[V:1 cl=treble] ";
            if (ClefRanges.treble.inRange(this.selectedNote) > 0) {
                s += this.selectedNote.toABC() + " [V:2 cl=bass] z4";
                this.abcString = s;
                this.abcScale = 2;
            }
            else if (ClefRanges.bass.inRange(this.selectedNote) > 0) {  
                s += "z4 [V:2 cl=bass] " + this.selectedNote.toABC();
                this.abcString = s;
                this.abcScale = 2;
            }
            else {
                console.log("BARG");
                //this.displayRandomNote();            
            }
        },
	    loadSoundFont: function () {
	        this.hint = "Loading...";
	        MIDI.loadPlugin({
			soundfontUrl: "./soundfonts/",
			api:"flash",
			instrument: "acoustic_grand_piano",
			onerror: function() {
				console.log("Failed to load soundfont.");
				app.hint = "Failed to load.";
				app.showHint = true;
			},
			onsuccess: function() {
				MIDI.setVolume(0, 200);
				app.showHint = false;
				app.loaded = true;
				console.log("Soundfont loaded.");
			}
		  });
	    },
		loadSong: function(id) {
			this.hint = "Loading...";
			this.showHint = true;
			axios({
				method: "get",
				url: "songs/" + id + ".abc",
				responseType: "text"
			}).then(function (response) {
				app.showHint = false;
				app.abcString = response.data;
			}).catch(function(error) {
				app.abcString = "";
				app.hint = "ERROR LOADING SONG";
				app.showHint = true;
			});
		},
		renderMusic: function() {
			ABCJS.renderAbc("music-page", this.abcString, { scale: this.abcScale });
		},
		openKeymapEditor: function() {
			if(!this.keymapEditorOpen) {
				this.keymapEditorOpen = true;
			}
		},
		closeKeymapEditor: function() {
			if(this.keymapEditorOpen) {
				this.keymapEditorOpen = false;
			}
		},
		pianoKeyDown: function(note) {
			let m = MIDI.keyToNote[note];
			MIDI.noteOn(0,m,127,0);
			if (this.selectedMode == "1") { // Single note playing
			    if(this.selectedNote.toMIDI() == m) {
			        this.showFail = false;
			        this.showSuccess = true;
                    this.displayRandomNote();			    
			    }
			    else {
                    this.showSuccess = false;
                    this.showFail = true;			    
			    }
		    }
		},
		pianoKeyUp: function(note) {
			let m = MIDI.keyToNote[note];
			MIDI.noteOff(0, m, 0);
			this.showSuccess = false;
			this.showFail = false;
		},
		pianoKeyEventCallback: function(note, isDown) {
			if(isDown) {
				this.pianoKeyDown(note);
				this.notesOn.push(note);
			}
			else {
				this.pianoKeyUp(note);
				this.notesOn.splice(this.notesOn.indexOf(note),1);
			}
		}
	},
	mounted: function () {
		// Set default keymapping. TODO: Make this load in from cookies.
		this.keymap.setKey("D3", "q");
		this.keymap.setKey("E3", "a");
		this.keymap.setKey("F3", "s");
		this.keymap.setKey("G3", "d");
		this.keymap.setKey("A3", "f");
		this.keymap.setKey("B3", "g");
		this.keymap.setKey("C4", "h");
		this.keymap.setKey("D4", "j");
		this.keymap.setKey("E4", "k");
		this.keymap.setKey("F4", "l");
		this.keymap.setKey("G4", ";");
		this.keymap.setKey("A4", "'");
		this.keymap.setKey("B4", "]");
		this.keymap.setKey("C5", "\\");
		this.boundNotes = ["D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5"];
        this.boundNoteRange = new NoteRange(new Note("D",3), new Note("C",5));

		this.keymap.addActionListener("D3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("E3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("F3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("G3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("A3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("B3", this.pianoKeyEventCallback);
		this.keymap.addActionListener("C4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("D4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("E4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("F4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("G4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("A4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("B4", this.pianoKeyEventCallback);
		this.keymap.addActionListener("C5", this.pianoKeyEventCallback);

		this.keymap.apply();

		this.displayRandomNote();

		this.hint = "Press Load Soundfont.";
		this.showHint = true;
	}
});
