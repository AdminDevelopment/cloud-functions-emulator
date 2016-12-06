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

const grpc = require('grpc');

const Client = require('./client');
const Model = require('../model');

const { Functions, protos } = Model;

const { CloudFunctionsService, Operations } = protos;

class GrpcClient extends Client {
  constructor (functions, opts) {
    super(functions, opts);

    this.functionsClient = new CloudFunctionsService(
      `${this.config.host}:${this.config.port}`,
      grpc.credentials.createInsecure()
    );
    this.operationsClient = new Operations(
      `${this.config.host}:${this.config.port}`,
      grpc.credentials.createInsecure()
    );
  }

  callFunction (name, data) {
    return new Promise((resolve, reject) => {
      this.functionsClient.callFunction({
        name: Functions.formatName(this.config.projectId, this.config.region, name),
        data: data
      }, (err, operation) => {
        if (err) {
          reject(err);
        } else {
          resolve(operation);
        }
      });
    });
  }

  createFunction (cloudfunction) {
    return new Promise((resolve, reject) => {
      this.functionsClient.createFunction({
        location: Functions.formatLocation(this.config.projectId, this.config.region),
        function: cloudfunction.toProtobuf()
      }, (err, operation) => {
        if (err) {
          reject(err);
        } else {
          resolve(operation);
        }
      });
    });
  }

  deleteFunction (name) {
    return new Promise((resolve, reject) => {
      this.functionsClient.deleteFunction({
        name: Functions.formatName(this.config.projectId, this.config.region, name)
      }, (err, operation) => {
        if (err) {
          reject(err);
        } else {
          operation.metadata = JSON.parse(Buffer.from(operation.metadata.value, 'base64').toString());
          operation.metadata.request = operation.metadata.request.value.toString('utf8');
          console.log(JSON.stringify(operation, null, 2));
          resolve(operation);
        }
      });
    });
  }

  getFunction (name) {
    return new Promise((resolve, reject) => {
      this.functionsClient.getFunction({
        name: Functions.formatName(this.config.projectId, this.config.region, name)
      }, (err, cloudfunction) => {
        if (err) {
          reject(err);
        } else {
          resolve([this.functions.cloudfunction(cloudfunction.name, cloudfunction)]);
        }
      });
    });
  }

  listFunctions () {
    return new Promise((resolve, reject) => {
      this.functionsClient.listFunctions({
        pageSize: 100,
        location: Functions.formatLocation(this.config.projectId, this.config.region)
      }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve([
            response.functions.map((cloudfunction) => this.functions.cloudfunction(cloudfunction.name, cloudfunction))
          ]);
        }
      });
    });
  }

  testConnection () {
    return new Promise((resolve, reject) => {
      // There's got to be a better way to get a "heartbeat" from the gRPC server
      this.functionsClient.listFunctions({ location: 'heartbeat' }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = GrpcClient;
