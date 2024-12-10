# :notes: :musical_keyboard: Piano Practice
A small virtual piano webapp.  

Demo link: [https://piano-app.tsengia.net/](https://piano-app.tsengia.net/)

## Current Demos
Below is a list of completed modes for learning to play:
- Single Note Practice _Practice matching notes on the staff to the correct keys_ 
- Free Play _Play any notes you want_

## Future Features
A planned TODO list of features and modes:
- Render time signatures
- Metronome
- Play Along
- Complete Sheet Music (with varying levels of skill)

Please note, I have no idea when I will actually work on these.  
Contributions are also welcome.

## Dependencies
The Piano Practice webapp would not be possible with the great contribution of the following open source libraries and resources:
- [MIDI.js](https://github.com/mudcube/MIDI.js)
- [midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts)
- [ABCJS](https://github.com/paulrosen/abcjs)
- [Vue3](https://github.com/vuejs/vue)

All libraries and resources noted above are redistributed in this repository with appropriate licensing files present.

Additionally, the favicon files were generated using the wonderful [realfavicongenerator.net](https://realfavicongenerator.net/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
yarn build

# Runs the end-to-end tests
yarn test:e2e
# Runs the tests only on Chromium
yarn test:e2e --project=chromium
# Runs the tests of a specific file
yarn test:e2e tests/example.spec.ts
# Runs the tests in debug mode
yarn test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
