/* eslint-disable @typescript-eslint/no-var-requires */
const govukFrontend = require('govuk-frontend');
govukFrontend.initAll();

window.setTimeoutWarning = require('./timeout-warning').setTimeoutWarning;
