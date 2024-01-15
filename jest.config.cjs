module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(chalk)/)" //Exclude 'chalk' from being ignored
  ],
  reporters: ['default'], // Esto puede redirigir las salidas de consola
  silent: true, // Esto suprime todas las salidas de consola
};


