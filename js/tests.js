/*
    This script contains tests that run at page load.

    Because this application is written in no-build JS, it is difficult to use a framework for testing, so this script serves as my way of testing my code without a framework.
*/

let passedTestCount = 0;
let failedTestCount = 0;

function assertIsTrue(value, message) {
    if (value) {
        passedTestCount++;
    }
    else {
        failedTestCount++;
        console.error("Failed test! " + message);
    }
}

function assertEqual(value, expected, testName) {
    assertIsTrue(value == expected, testName + " failed! Expected " + expected + " but got " + value);
}

function testRandomNoteRangeC4() {
    const c4 = new Note("C", 4);
    const range = new NoteRange(c4, c4);

    assertEqual(range.getRandomNote().toString(), "C4", "NoteRange(C4,C4)!");
}

function testBoundRandomNoteRange() {
    const range = new NoteRange(new Note("D",3), new Note("C",5));

    for (let i = 0; i < 2000; i++) {
        let note = range.getRandomNote().toString();
        let valid = ["D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5"].indexOf(note) != -1;
        if (!valid) {
            
            assertIsTrue(false, "testBoundRandomNoteRange() Got note " + note + " which outside of bound keys!");
            break;
        }
    }

    assertIsTrue(true, "testBoundRandomNoteRange() returned all valid notes.");
}


function testNoteRangeLength() {
    const rangeC4 = new NoteRange(new Note("C",4), new Note("C",4));
    assertEqual(rangeC4.getNumberOfNotesInRange(),1, "Number of notes in NoteRange(C4,C4)");

    const rangeC4D4 = new NoteRange(new Note("C",4), new Note("D",4));
    assertEqual(rangeC4D4.getNumberOfNotesInRange(),2, "Number of notes in NoteRange(C4,D4)");
    
    const rangeC4E4 = new NoteRange(new Note("C",4), new Note("E",4));
    assertEqual(rangeC4E4.getNumberOfNotesInRange(),3, "Number of notes in NoteRange(C4,E4)");
    
    const rangeB3C4 = new NoteRange(new Note("B",3), new Note("C",4));
    assertEqual(rangeB3C4.getNumberOfNotesInRange(),2, "Number of notes in NoteRange(B3,C4)");

    const rangeA3D4 = new NoteRange(new Note("A",3), new Note("D",4));
    assertEqual(rangeA3D4.getNumberOfNotesInRange(),4, "Number of notes in NoteRange(A3,D4)");
}

function runAllTests() {
    failedTestCount = 0;
    passedTestCount = 0;

    testRandomNoteRangeC4();
    testBoundRandomNoteRange();
    testNoteRangeLength();

    if (failedTestCount == 0 && passedTestCount > 0) {
        console.log("All tests passed! Ran total of " + passedTestCount + " tests.");
    }
    else if (failedTestCount != 0) {
        console.error(failedTestCount + " tests failed and " + passedTestCount + " tests passed.");
    }
    else {
        console.warn("WARNING: No tests ran!");
    }
}

runAllTests();
