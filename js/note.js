var ClefRanges = {};
var Scales = {};

//Parent class for holding either multiple notes or rests
class Beat {
	_resetABCDuration() {
		if(this.duration.indexOf("/") != -1) {
			this.abcDuration = "/" + this.duration.split("/")[1];
		}
		else {
			this.abcDuration = this.duration;
		}
	}

	set duration(value) {
		this._duration = value;
		this._resetABCDuration();
	}

	get duration() {
		return this._duration;
	}

	constructor(duration) {
		this._duration = duration;
		this._resetABCDuration();
	}
}

class Note extends Beat {
	toString() {
		return this.note + (this.flat ? "b" : "" ) + this.octave;
	}

	sameNote(n) {
		return this.note == n.note && this.octave == n.octave && this.sharp == n.sharp;
	}

	toMIDI() {
		return MIDI.keyToNote[this.toString()];
	}

	toABC(origin_octave=4) {
		var i = this.octave;
		var s = this.note.toUpperCase();
		while(i > origin_octave) {
			s += "'";
			i--;
		}
		while(i < origin_octave) {
			s += ",";
			i++;
		}

		return s + (this.flat ? "_" : "") +  this.abcDuration;
	}
	
	// A positive distance means a higher pitch, a negative distance means a lower pitch
	getNoteAtDistance(distance) {
	   var n = this._notesList[this.note];
	   var o = this.octave;	   
	   distance = Math.floor(distance); // make sure it's an integer
	   var direction = distance / Math.abs(distance);
	   while(distance != 0) {
	       n += direction;
	       distance -= direction;
	       if (n > 6) {
                o++;
                n = 0;
	       }
	       if (n < 0) {
	           o--;
	           n = 6;
	       }
	   }
	   return new Note(this._listNotes[n],o,this.duration);
	}

	//Convert a scientific notation note to a Note. DOES NOT WORK WITH FLATS
	static getNote(s, duration="2") {
		if(s.length != 2) {
			return false;
		}
		else {
			return new Note(s[0], s[1], duration, false);
		}
	}

	constructor(note, octave, duration="2", flat=false) {
		super(duration);
		this.note = note.toUpperCase();
		this.octave = octave;
		this.flat = flat;
		this._notesList = {"C":0, "D":1, "E":2, "F":3, "G":4, "A":5, "B":6}; // Ordered in appearance on octave
        this._listNotes = ["C", "D", "E", "F", "G", "A", "B"];	
	}
}

class Rest extends Beat {

	toString() {
		return "r" + this.duration;
	}

	toABC() {
		return "z" + this.abcDuration;
	}

	constructor(duration) {
		super(duration);
	}
}

class Measure { /// TODO: Add method of setting repetition
	addRest(duration) {
		this.beats.push(new Rest(duration));
	}

	addNote(note, octave, duration, flat) {
		this.beats.push(new Note(note, octave, duration, flat));
	}
	
	addBeat(beat) {
        this.beats.push(beat);	
	}

	toABC() {
		var s = "";
		this.beats.forEach(function(i,j) {
			s += i.toABC();
		});
		return s + "|";
	}

	constructor(timeSignature) {
        this.beats = [];	
        this.timeSignature = timeSignature;
	}
}

class TimeSignature {
    isEqual(ts) {
        return this.top == ts.top && this.bottom == ts.bottom;    
    }
    
	toABC() {
		return "[M:" + top + "/" + bottom + "]";
	}

	constructor(top, bottom) {
		this.top = top;
		this.bottom = bottom;
	}
}

class NoteRange {
    /// Represents a consecutive range of notes.

    inRange(note) { /// Returns 0 if outside of range. Returns 1 if on end of range. Returns 2 if within range.
        if(!note instanceof Note) {
            return false;        
        }
        
        var noteIndex = this._notesList[note.note];
        var minIndex = this._notesList[this.min.note];
        var maxIndex = this._notesList[this.max.note];
        
        // If outside of the octave range, definitely not in range
        if (note.octave < this.min.octave || note.octave > this.max.octave) {
            return 0;
        }
        if (note.octave == this.min.octave && noteIndex < minIndex) {
            return 0;
        }
        if (note.octave == this.max.octave && noteIndex > maxIndex) {
            return 0;
        }

        if (note.octave == this.min.octave && noteIndex == minIndex) {
            return 1;        
        }        
        if (note.octave == this.max.octave && noteIndex == maxIndex) {
            return 1;
        }
        
        return 2;
    }
    
    getRandomNote() {
        var distance = 8 * (this.max.octave - this.min.octave);
        distance += this._notesList[this.max.note] - this._notesList[this.min.note] - 1;
        distance = Math.floor(Math.random()*distance);
        return this.min.getNoteAtDistance(distance);
    }

    constructor(min, max) { // min and max must both be Notes
        this.min = min;
        this.max = max;
        this._notesList = {"C":0, "D":1, "E":2, "F":3, "G":4, "A":5, "B":6}; // Ordered in appearance on octave
    }
}

class Stave {

	toABC() {
		var s = "[V:" + this.id +" cl=" + this.clef + "]";
		return s;
	}
	
	inRange(note) { // Returns 0 if the note is out of the range of the stave. Returns 1 if on edge. Returns 2 if within range
	   return ClefRanges[this.clef].inRange(note);
	}

	constructor(voiceID, clef) {
		this.clef = clef;
		this.id = voiceID;
	}
}

class Instrument {
	
	toABC() {
	    var txt = "";
		for (var s in this.staves) {
            txt += s.toABC();
            var lastTimeSignature = {top: -1, bottom: -1};
            for (var m in this.measures) {
                if (!m.timeSignature.isEqual(lastTimeSignature)) {
                    lastTimeSignature = m.timeSignature;
                    txt += lastTimeSignature.toABC();          
                }
                
                var restDuration = 0;
                for (var b in m.beats) {
                    if (b instanceof Rest) {
                        restDuration += b.duration;
                    }
                    else if (restDuration > 0) {
                        txt += "z" + restDuration;
                        restDuration = 0;
                    }
                    else if (b instanceof Note) {
                        var within = s.inRange(b);
                        if (within == 0) {
                            restDuration += b.duration;
                        }
                        else if (within == 1) {
                            if (restDuration > 0) {
                                restDuration += b.duration;                                
                            }
                            else {
                                txt += b.toABC();
                            }
                        }
                        else if (within == 2) {
                            txt += b.toABC();
                        }
                        else {
                            console.error("Invalid valid for inRange() recieved! " + within);
                        }
                    }
                }
                if (restDuration > 0) {
                    txt += "z" + restDuration;                
                }
                txt += "|";
            }
		}
	}
	
	createStave(clef) {
        this.staves.push(new Stave(this.staves.length, clef));
        return this.staves.length - 1;
	}

	constructor(name) {
		this.name = name;
		this.staves = [];
		this.measures = [];
	}
}

class Song {

	toABC(instrument = "piano") {
		var s = "T:" + this.name + "\nK:" + this.key;
		s += this.instruments[instrument].toABC();
		return s;
	}

	constructor(name, key="C") {
		this.name = name;
		this.instruments = {};
		this.key = key;
	}
}

ClefRanges.treble = new NoteRange(new Note("C",4), new Note("A",5));
ClefRanges.alto = new NoteRange(new Note("D",3), new Note("B",4));
ClefRanges.bass = new NoteRange(new Note("E",2), new Note("C",4));

Scales["C Major"] = [new Note("C",4), new Note("D",4), new Note("E",4), new Note("F",4), new Note("G",4), new Note("A",4), new Note("B",4), new Note("C", 5)];
Scales["C Minor"] = [new Note("C",4), new Note("D",4), new Note("E",4,"2",true), new Note("F",4), new Note("G",4), new Note("A",4,"2",true), new Note("B",4, "2",true), new Note("C", 5)];

/**

Song -> Instruments -> Instrument -> Measures
 |                  |> Instrument -> Measures
 - Title, Key, 
 
Convert song to ABC:
Title, Key
Select desired instrument

for each stave in instrument:
    Output clef & stave string start
    For each measure in instrument:
        For each beat in measure:
            If note in range of key & clef:
                if rest in progress:
                    add rest to string, reset duration
                add note to string
            If note not in range:
                add 1 to current rest duration
            if note on edge of range:
                if rest in progress:
                    add 1 to current rest duration
                else:            
                    add note to string
            if beat is rest:
                add rest duration to current rest duration
        if rest in progress:
            add rest to string, reset duration
        add measure ending to string


*/
