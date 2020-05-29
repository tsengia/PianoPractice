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

class TimeSignature {
	constructor(top, bottom) {
		this.top = top;
		this.bottom = bottom;
	}
}


class Note extends Beat {
	static notesList = ["A", "B", "C", "D", "E", "F", "G"];

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
		var s = this.note.toLowerCase();
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

class Measure {
	beats = []

	addRest(duration) {
		this.beats.push(new Rest(duration));
	}

	addNote(note, octave, duration, flat) {
		this.beats.push(new Note(note, octave, duration, flat));
	}

	toABC() {
		var s = "";
		this.beats.forEach(function(i,j) {
			s += i.toABC();
		});
		return s;
	}
}
