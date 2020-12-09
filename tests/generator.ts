import Pester from './../src';
import fetch from 'node-fetch';

export const notWorkingInstance = Pester.create(fetch, { baseUrl: 'http://localhost:3001', treatEverythingAsJson: true });
export const workingInstance = Pester.create(fetch, { baseUrl: 'http://localhost:3000', treatEverythingAsJson: true });