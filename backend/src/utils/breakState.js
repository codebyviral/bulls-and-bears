// breakState.js
// Shared, importable break/pause flag for the simulation. Previously this
// lived as a bare `let isBreak` inside server.js's closure, which meant the
// only way to toggle it was the "toggle_break" socket event — there was no
// admin-authenticated REST control and no other module could read it.
export const breakState = {
  isBreak: false,
};
