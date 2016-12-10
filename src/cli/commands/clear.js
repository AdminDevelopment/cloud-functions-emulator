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
const list = require('./list').handler;

/**
 * http://yargs.js.org/docs/#methods-commandmodule-providing-a-command-module
 */
exports.command = 'clear';
exports.describe = 'Resets the emulator to its default state and clears and deployed functions.';
exports.builder = {};

/**
 * Handler for the "clear" command.
 *
 * @param {object} opts Configuration options.
 */
exports.handler = (opts) => {
  const controller = new Controller(opts);

  return controller.doIfRunning()
    .then(() => controller.clear())
    .then(() => {
      controller.write(controller.name);
      controller.write(' CLEARED\n'.green);
    })
    .then(() => list(opts))
    .catch((err) => controller.handleError(err));
};
