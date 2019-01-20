const Mock = require('mockjs');
const myMock = require('../src/mock-data/index');

const obj = {
  a: 1,
  b: 2,
  'c|5-10': 3,
  sentence: 'aaa bbb',
  word: 'the',
  obj: {
    11: 'aa',
    22: 'bb',
    'x|5-10': 2,
    's|3-5': 'abc',
    person: {
      name: 'xxx',
      age: 1,
    },
  },
  array: [1, 2, { s: 'b' }, [1]],
};

const result1 = Mock.mock(obj);
console.info(result1);
const result2 = myMock(obj);
console.info(result2);
