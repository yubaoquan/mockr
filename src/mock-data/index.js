// TODO need test
const Mock = require('mockjs');
const getType = require('../util/type');

function mock(json) {
  const jsonType = getType(json);
  switch (jsonType) {
    case 'number':
      return mockNumber(json);
    case 'string':
      return mockString(json);
    case 'null':
    case 'undefined':
      return json;
    case 'object':
      return mockObject(json);
    case 'array':
      return mockArray(json);
    default:
      console.error(`Unknown data type:`, jsonType);
      break;
  }
}

function mockNumber(number) {
  return number;
}

function mockString(str) {
  return str;
}

function mockObject(obj) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = mockItem(key, obj[key]);
    return result;
  }, {});
}

function mockArray(arr) {
  const resultLength = Math.floor(Math.random() * 100);
  return new Array(resultLength)
    .fill(null)
    .map((item, index) => {
      if (index < arr.length) {
        return mockItem(item);
      }
      return mockItem(arr[index % arr.length]);
    });
}

function mockItem(key, value) {
  if (isMockjsFormat(key, value)) {
    return standardMock(key, value);
  }
  return mock(value);
}

function isMockjsFormat(key, value) {
  return true;
}

function standardMock(key, value) {
  if (isMockjsFormat(key)) {
    return Mock.mock({ [key]: value })[key];
  }
  throw new Error(`Key ${key} is not in mockjs format`);
}

module.expors = mock;
