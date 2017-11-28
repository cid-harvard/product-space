const webpackDevConfig = '--config dev.webpack.babel.js';
const tslintCommand = 'tslint --project tsconfig.json --config tslint.json';
const eslintCommand = 'eslint .';

/* Start of stylelint */
const stylelintCommandCSS = 'stylelint "src/**/*.css" --config css.stylelint.config.js';
const stylelintCommandTypeScriptConfig = '--config typescript.stylelint.config.js';
const stylelintCommandTS = `stylelint "src/**/*.ts" ${stylelintCommandTypeScriptConfig}`;
const stylelintCommandTSX = `stylelint "src/**/*.tsx" ${stylelintCommandTypeScriptConfig}`;
/* End of stylelint */

module.exports = {
  scripts: {
    build: {
      dev: `webpack --env.development ${webpackDevConfig}`,
    },
    dev: {
      script: `webpack-dev-server --env.development ${webpackDevConfig}`,
      description: 'Run local dev server',
    },
    tslint: {
      script: tslintCommand,
      fix: {
        script: `${tslintCommand} --fix`,
      },
    },
    eslint: {
      script: eslintCommand,
      fix: {
        script: `${eslintCommand} --fix`,
      },
    },
    stylelint: {
      script: 'nps stylelint.css && nps stylelint.ts && nps stylelint.tsx',
      css: {
        script: stylelintCommandCSS,
        description: 'Run stylelint on CSS files',
      },
      ts: {
        script: stylelintCommandTS,
        description: 'Run stylelint on TS files',
      },
      tsx: {
        script: stylelintCommandTSX,
        description: 'Run stylelint on TSX files',
      },
    },

  },
};
