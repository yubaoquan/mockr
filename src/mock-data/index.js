/**
 * 此模块用于根据json文件生成mock数据, 如果json(全部或部分)格式符合mockjs的格式, 则直接按照mockjs的方式生成数据;
 * 如果不符合, 则随机生成.
 * 暂不考虑值是正则表达式或函数的情况
 * 随机规则:
 *   boolean: 随机true/false
 *   字符串: 如果包含空格, 则生成一个英文句子格式的字符串(多个单词空格隔开); 否则生成一个英文单词
 *   数字: 0-10000
 *   数组: 0-max个元素, max=Math.max(数组长度, 20). 每个元素按照原数组(或取模后)对应位置的元素为模板生成
 *   null: null
 *   undefined: undefined
 */

const Mock = require('mockjs');
const { getType } = require('../util/type');

const { Random } = Mock;

function mock(json) {
  const jsonType = getType(json);
  switch (jsonType) {
    case 'number':
    case 'string':
    case 'boolean':
      return mockUtils[jsonType](json);
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

const mockUtils = {
  number(value) {
    const isFloat = String(value).includes('.');
    return isFloat ? Random.float(0, 10000) : Random.integer(0, 10000);
  },
  string(value) {
    const isSentense = value.includes(' ');
    return isSentense ? Random.sentence() : Random.word();
  },
  boolean(value) {
    return Random.boolean();
  },
};

function mockObject(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const newObj = mockItem(key, obj[key]);
    return Object.assign(result, newObj);
  }, {});
}

function mockArray(arr) {
  const maxLength = arr.length > 20 ? arr.length + 1 : 20;
  const resultLength = Math.floor(Math.random() * maxLength);
  return new Array(resultLength)
    .fill(null)
    .map((item, index) => {
      if (index < arr.length) {
        return mock(arr[index]);
      }
      return mock(arr[index % arr.length]);
    });
}

function mockItem(key, value) {
  if (isMockjsFormat(key, value)) {
    return Mock.mock({ [key]: value });
  }
  return { [key]: mock(value) };
}

function isMockjsFormat(key, value) {
  const valueType = getType(value);
  const regs = {
    // rules when value is string
    string: [
      // 'name|min-max': string
      /[^|]*\|\d*-\d*/,
      // 'name|count': string
      /[^|]*\|\d*/,
    ],
    // rules when value is number
    number: [
      // name|+1
      /[^|]*\|+\d/,
      // name|min-max
      /[^|]*\|\d*-\d*/,
      // 'name|min-max.dmin-dmax'
      /[^|]*\|\d*-\d*\.\d*-\d*/,
    ],
    boolean: [
      // name|1
      /[^|]*\|1/,
      // 'name|min-max': value
      /[^|]*\|\d*-\d*/,
    ],
    object: [
      // name|count
      /[^|]*\|\d*/,
      // name|min-max
      /[^|]*\|\d*-\d*/,
    ],
    array: [
      // name|1
      /[^|]*\|1/,
      // name|+1
      /[^|]*\|+\d/,
      // 'name|min-max': value
      /[^|]*\|\d*-\d*/,
      // name|count
      /[^|]*\|\d*/,
    ],
    function: [
      /./,
    ],
    regexp: [
      /./,
    ],
  };
  return regs[valueType].some(reg => reg.test(key));
}

module.exports = mock;
