const expect = require('chai').expect;
const Compare = require('../../src/helpers/compare');
const handler = require('../../src/exports/handler');
const settings = require('../../src/exports/settings');

describe('JSON Like - Object - Equal Properties', () => {

  it('object equals - empty', () => {
    const actual = {};
    const expected = {};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object equals - different types of properties', () => {
    const actual = {
      id: 1,
      name: 'bob',
      minor: true,
      any: null,
      age: 8
    };
    const expected = {
      id: 1,
      name: 'bob',
      minor: true,
      any: null,
      age: /\d+/
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object not equals - one property - number', () => {
    const actual = {
      id: 1
    };
    const expected = {
      id: 2
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '2' at '$.id' but found '1'`);
  });

  it('object not equals - one property - different types', () => {
    const actual = {
      id: 1
    };
    const expected = {
      id: '1'
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have type 'string' at '$.id' but found 'number'`);
  });

  it('object not equals - different types - actual array', () => {
    const actual = [{ id: 1 }];
    const expected = {
      id: '1'
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have type 'object' at '$' but found 'array'`);
  });

  it('object not equals - different types - expected array', () => {
    const expected = [{ id: 1 }];
    const actual = {
      id: '1'
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have type 'array' at '$' but found 'object'`);
  });

  it('object not equals - one property - string', () => {
    const actual = {
      id: "1"
    };
    const expected = {
      id: "2"
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '2' at '$.id' but found '1'`);
  });

  it('object not equals - one property - boolean', () => {
    const actual = {
      id: false
    };
    const expected = {
      id: true
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value 'true' at '$.id' but found 'false'`);
  });

  it('object not equals - one property - null', () => {
    const actual = {
      id: {}
    };
    const expected = {
      id: null
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).contains(`Json doesn't have value 'null' at '$.id' but found`);
  });

  it('object not equals - one property - RegEx', () => {
    const actual = {
      id: 1
    };
    const expected = {
      id: /\W+/
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't match with '/\\W+/' at '$.id' but found '1'`);
  });

  it('object not equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt'
    };
    const expected = {
      id: 1,
      name: 'bent'
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value 'bent' at '$.name' but found 'hunt'`);
  });

  it('nested objects equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    };
    const expected = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('nested objects not equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    };
    const expected = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 50,
          chemistry: 45
        }
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '50' at '$.scores.sciences.physics' but found '40'`);
  });

});

describe('JSON Like - Object - Extra Properties', () => {

  it('object not equals - one property', () => {
    const actual = {
      id: "1"
    };
    const expected = {
      name: "2"
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have property 'name' at '$'`);
  });

  it('object equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt'
    };
    const expected = {
      id: 1
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object not equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt'
    };
    const expected = {
      id: 1,
      age: 26
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have property 'age' at '$'`);
  });

  it('nested object equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80
      }
    };
    const expected = {
      name: 'hunt',
      scores: {
        social: 80,
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('nested object not equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80
      }
    };
    const expected = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        art: 12
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have property 'art' at '$.scores'`);
  });

  it('nested objects equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    };
    const expected = {
      name: 'hunt',
      scores: {
        social: 80,
        sciences: {
          physics: 40
        }
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('nested objects not equals - multiple properties', () => {
    const actual = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    };
    const expected = {
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45,
          biology: 21
        }
      }
    };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have property 'biology' at '$.scores.sciences'`);
  });

});

describe('JSON Like - Array', () => {

  it('array equals - empty', () => {
    const actual = [];
    const expected = [];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array equals - one item - number', () => {
    const actual = [1];
    const expected = [1];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array not equals - one item - number', () => {
    const actual = [1];
    const expected = [2];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '2' at '$[0]' but found '1'`);
  });

  it('array equals - multiple items - number', () => {
    const actual = [1, 2, 3];
    const expected = [1, 2, 3];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array equals - multiple items (reverse order) - number', () => {
    const actual = [1, 2, 3];
    const expected = [3, 2, 1];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array not equals - multiple expected items', () => {
    const actual = [1];
    const expected = [2, 3];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have 'array' with length '2' at '$' but found 'array' with length '1'`);
  });

  it('array not equals - multiple actual items', () => {
    const actual = [1, 4];
    const expected = [2, 3];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '2' at '$[0]' but found '1'`);
  });

  it('array not equals - multiple actual items - last item doesn\'t match', () => {
    const actual = [1, 4];
    const expected = [1, 3];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '3' at '$[1]' but found '4'`);
  });

  it('nested array equals - multiple items - number', () => {
    const actual = [[1, 2], [2, 4]];
    const expected = [[1, 2], [2, 4]];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('nested array equals - multiple items (reverse) - number', () => {
    const actual = [[1, 2], [2, 4]];
    const expected = [[2, 4], [1, 2]];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('nested array not equals - multiple items - number', () => {
    const actual = [[1, 2], [2, 4]];
    const expected = [[1, 2], [3, 5]];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '3' at '$[1][0]' but found '2'`);
  });

  it('nested array not equals - multiple actual items - number', () => {
    const actual = [[1, 2], [2, 4], [3, 4]];
    const expected = [[1, 2], [3, 5]];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '3' at '$[1][0]' but found '2'`);
  });

  it('array equals - multiple expected items - number', () => {
    const actual = [1, 2, 3, 2];
    const expected = [2, 2];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array not equals - multiple expected items - number', () => {
    const actual = [1, 2, 3];
    const expected = [2, 2];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have expected value at '$[1]'`);
  });

});

describe('JSON Like Array of Objects', () => {

  it('equals - empty arrays', () => {
    const actual = [{}];
    const expected = [{}];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('equals - empty expected array', () => {
    const actual = [{
      id: 1
    }];
    const expected = [{}];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('equals - array of one object with one property', () => {
    const actual = [{
      id: 1
    }];
    const expected = [{
      id: 1
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one object with one property', () => {
    const actual = [{
      id: 1
    }];
    const expected = [{
      id: 2
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '2' at '$[0].id' but found '1'`);
  });

  it('equals - array of one object with multiple properties', () => {
    const actual = [{
      id: 1,
      name: 'hunt'
    }];
    const expected = [{
      id: 1,
      name: 'hunt'
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one object with multiple properties', () => {
    const actual = [{
      id: 1,
      name: 'hunt'
    }];
    const expected = [{
      id: 1,
      name: 'bent'
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value 'bent' at '$[0].name' but found 'hunt'`);
  });

  it('equals - array of one nested object', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one nested object', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 70
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '70' at '$[0].scores.social' but found '80'`);
  });

  it('equals - array of one with nested objects', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one with nested objects', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        }
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 30,
          chemistry: 45
        }
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '30' at '$[0].scores.sciences.physics' but found '40'`);
  });

  it('equals - array of one with nested objects & array of numbers', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [21, 22]
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [21, 22]
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one with nested objects & array of numbers', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [21, 22]
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [20, 22]
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '20' at '$[0].scores.languages[0]' but found '21'`);
  });

  it('equals - array of one with nested objects & array of objects', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [
          {
            english: 44,
            telugu: 49
          },
          {
            english: 42,
            telugu: 50
          }
        ]
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [
          {
            english: 44,
            telugu: 49
          },
          {
            english: 42,
            telugu: 50
          }
        ]
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of one with nested objects & array of objects', () => {
    const actual = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [
          {
            english: 44,
            telugu: 49
          },
          {
            english: 42,
            telugu: 50
          }
        ]
      }
    }];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [
          {
            english: 44,
            telugu: 49
          },
          {
            english: 41,
            telugu: 50
          }
        ]
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '41' at '$[0].scores.languages[1].english' but found '42'`);
  });

  it('equals - array of multiple with nested objects & array of objects', () => {
    const actual = [
      {
        id: 1,
        name: 'hunt',
        scores: {
          maths: 90,
          social: 80,
          sciences: {
            physics: 40,
            chemistry: 45
          },
          languages: [
            {
              english: 44,
              telugu: 49
            },
            {
              english: 42,
              telugu: 50
            }
          ]
        }
      },
      {
        id: 2,
        name: 'bent',
        scores: {
          maths: 99,
          social: 60,
          sciences: {
            physics: 49,
            chemistry: 46
          },
          languages: [
            {
              english: 43,
              telugu: 42
            },
            {
              english: 41,
              telugu: 40
            }
          ]
        }
      }
    ];
    const expected = [{
      id: 1,
      name: 'hunt',
      scores: {
        maths: 90,
        social: 80,
        sciences: {
          physics: 40,
          chemistry: 45
        },
        languages: [
          {
            english: 44,
            telugu: 49
          },
          {
            english: 42,
            telugu: 50
          }
        ]
      }
    }];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('equals - array of multiple with nested objects & array of objects - trimmed expected', () => {
    const actual = [
      {
        id: 1,
        name: 'hunt',
        scores: {
          maths: 90,
          social: 80,
          sciences: {
            physics: 40,
            chemistry: 45
          },
          languages: [
            {
              english: 44,
              telugu: 49
            },
            {
              english: 42,
              telugu: 50
            }
          ]
        }
      },
      {
        id: 2,
        name: 'bent',
        scores: {
          maths: 99,
          social: 60,
          sciences: {
            physics: 49,
            chemistry: 46
          },
          languages: [
            {
              english: 43,
              telugu: 42
            },
            {
              english: 41,
              telugu: 40
            }
          ]
        }
      }
    ];
    const expected = [
      {
        id: 1,
        name: 'hunt',
        scores: {
          maths: 90,
          social: 80,
          sciences: {
            physics: 40,
            chemistry: 45
          },
          languages: [
            {
              english: 44,
              telugu: 49
            },
            {
              english: 42,
              telugu: 50
            }
          ]
        }
      },
      {
        id: 2,
        name: 'bent',
        scores: {
          social: 60,
          sciences: {
            chemistry: 46
          },
          languages: [
            {
              english: 43,
            },
            {
              telugu: 40
            }
          ]
        }
      }
    ];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - array of multiple with nested objects & array of objects - trimmed expected', () => {
    const actual = [
      {
        id: 1,
        name: 'hunt',
        scores: {
          maths: 90,
          social: 80,
          sciences: {
            physics: 40,
            chemistry: 45
          },
          languages: [
            {
              english: 44,
              telugu: 49
            },
            {
              english: 42,
              telugu: 50
            }
          ]
        }
      },
      {
        id: 2,
        name: 'bent',
        scores: {
          maths: 99,
          social: 60,
          sciences: {
            physics: 49,
            chemistry: 46
          },
          languages: [
            {
              english: 43,
              telugu: 42
            },
            {
              english: 41,
              telugu: 40
            }
          ]
        }
      }
    ];
    const expected = [
      {
        id: 1,
        name: 'hunt',
        scores: {
          maths: 90,
          social: 80,
          sciences: {
            physics: 40,
            chemistry: 45
          },
          languages: [
            {
              english: 44,
              telugu: 49
            },
            {
              english: 42,
              telugu: 50
            }
          ]
        }
      },
      {
        id: 2,
        name: 'bent',
        scores: {
          social: 60,
          sciences: {
            chemistry: 46
          },
          languages: [
            {
              english: 42,
            },
            {
              telugu: 40
            }
          ]
        }
      }
    ];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '42' at '$[1].scores.languages[0].english' but found '43'`);
  });

  it('equals - different order', () => {
    const actual = [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      },
      {
        id: 4
      },
      {
        id: 5
      },
      {
        id: 6
      }
    ];
    const expected = [
      {
        id: 4
      },
      {
        id: 3
      },
      {
        id: 5
      },
      {
        id: 6
      },
      {
        id: 2
      },
      {
        id: 1
      }
    ];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('not equals - different order', () => {
    const actual = [
      {
        id: 1
      },
      {
        id: 2
      },
      {
        id: 3
      },
      {
        id: 4
      }
    ];
    const expected = [
      {
        id: 4
      },
      {
        id: 3
      },
      {
        id: 1
      },
      {
        id: 1
      }
    ];
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have expected value at '$[3]'`);
  });

});

describe('JSON Like - Assert Expressions', () => {

  it('object fulfil simple expression', () => {
    const actual = { id: 1 };
    const expected = { id: '$V === 1'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object does not fulfil simple expression', () => {
    const actual = { id: 1 };
    const expected = { id: '$V > 1'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't fulfil expression '$.id > 1'`);
  });

  it('array fulfil simple expression', () => {
    const actual = [{ id: 1 }];
    const expected = '$V.length === 1';
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('array does not fulfil simple expression', () => {
    const actual = [{ id: 1 }];
    const expected = '$V.length > 1';
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't fulfil expression '$.length > 1'`);
  });

  it('object fulfil complex expression', () => {
    const actual = { id: 1, marks: { maths: 70 } };
    const expected = { id: 1, marks: { maths: '$V > 50' } };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object does not fulfil complex expression', () => {
    const actual = { id: 1, marks: { maths: 70 } };
    const expected = { id: 1, marks: { maths: '$V > 80' } };
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't fulfil expression '$.marks.maths > 80'`);
  });

  it('object fulfil simple custom includes expression', () => {
    settings.setAssertExpressionStrategy({ includes: '$' });
    const actual = { id: 1 };
    const expected = { id: '$ === 1'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  afterEach(() => {
    settings.setAssertExpressionStrategy({ includes: '$V' });
  });

});

describe('JSON Like - Assert Handlers', () => {

  before(() => {
    handler.addAssertHandler('number', (ctx) => {
      return typeof ctx.data === 'number';
    });
    handler.addAssertHandler('type', (ctx) => {
      return typeof ctx.data === ctx.args[0];
    });
  });

  it('object fulfil simple assert', () => {
    const actual = { id: 1 };
    const expected = { id: '#number'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object does not fulfil simple assert', () => {
    const actual = { id: '1' };
    const expected = { id: '#number'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't fulfil assertion '#number' at '$.id'`);
  });

  it('object fulfil simple assert with args', () => {
    const actual = { id: 1 };
    const expected = { id: '#type:number'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('simple assert does not exist', () => {
    const actual = { id: '1' };
    const expected = { id: '#number py'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '#number py' at '$.id' but found '1'`);
  });

  it('object fulfil simple custom starts with assert', () => {
    settings.setAssertHandlerStrategy({ starts: '#$' });
    const actual = { id: 1 };
    const expected = { id: '#$number'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object fulfil simple custom ends with assert', () => {
    settings.setAssertHandlerStrategy({ ends: '#$' });
    const actual = { id: 1 };
    const expected = { id: 'number#$'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('object fulfil simple custom starts & ends with assert', () => {
    settings.setAssertHandlerStrategy({ starts: '#$', ends: '$#' });
    const actual = { id: 1 };
    const expected = { id: '#$number$#'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(true);
  });

  it('simple assert satisfies only one strategy', () => {
    settings.setAssertHandlerStrategy({ starts: '#', ends: '$#' });
    const actual = { id: '1' };
    const expected = { id: '#number'};
    const compare = new Compare();
    const res = compare.jsonLike(actual, expected);
    expect(res.equal).equals(false);
    expect(res.message).equals(`Json doesn't have value '#number' at '$.id' but found '1'`);
  });

  afterEach(() => {
    settings.setAssertHandlerStrategy({ starts: '#' });
  });

});