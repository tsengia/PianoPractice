# :notes: :musical_keyboard: Piano Practice
A small virtual piano webapp.  

Demo link: [https://piano-app.tsengia.net/](https://piano-app.tsengia.net/)

## Current Demos
Below is a list of completed modes for learning to play:
- Single Note Practice _Practice matching notes on the staff to the correct keys_ 
- Free Play _Play any notes you want_

## Dependencies
The Piano Practice webapp would not be possible with the great contribution of the following open source libraries and resources:
- [MIDI.js](https://github.com/mudcube/MIDI.js)
- [midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts)
- [ABCJS](https://github.com/paulrosen/abcjs)
- [Vue2](https://github.com/vuejs/vue)

All libraries and resources noted above are redistributed in this repository with appropriate licensing files present.

Additionally, the favicon files were generated using the wonderful [realfavicongenerator.net](https://realfavicongenerator.net/).


## Developing
This application does not use the typical NodeJS/Create-React-App tooling.
In fact, this application doesn't even use a package manager such as `npm`.

It's written in plain JavaScript, HTML, CSS, and bundles all dependencies locally.

If I could change the past, I would rewrite it in React and use proper TypeScript, React, and modern JS tools.

Anyways, to host this web-app locally, I recommend installing a recent version of Python and running the below command:
```bash
python -m http.server
```

This should host the web-app on your local machine and allow you to load the sound-font and play.

### Running Tests
As mentioned before, this app does not use any testing frameworks.
Instead, there is a [`js/tests.js`](js/tests.js) file that contains functions that are run on page load.
Test results are displayed to console.

These tests are more "unit" test oriented, and can be helpful for finding logic/mathematical errors in methods and functions.