/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Controller = require('../controller');
const utils = require('../utils');

/**
 * http://yargs.js.org/docs/#methods-commandmodule-providing-a-command-module
 */
exports.command = 'stop';
exports.describe = 'Stops the emulator gracefully.';
exports.builder = {
  timeout: {
    alias: 't',
    description: 'The timeout in milliseconds to wait for the emulator to stop.',
    requiresArg: true,
    type: 'number'
  }
};

/**
 * Handler for the "stop" command.
 *
 * @param {object} opts Configuration options.
 */
exports.handler = (opts) => {
  const controller = new Controller(opts);

  return controller.doIfRunning()
    .then(() => {
      utils.writer.log(`Stopping ${controller.name}...`);
      return controller.stop();
    })
    .then(() => {
      utils.writer.write(controller.name);
      utils.writer.write(' STOPPED\n'.red);
    })
    .catch(utils.handleError);
};
