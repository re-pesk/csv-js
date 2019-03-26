const { Converter } = require('./Converter');

function setReplacer(value, privateProperties) {
  if (!['undefined', 'function'].includes(typeof value) && value !== null) {
    throw new TypeError('Value of replacer property must be function, null or undefined.');
  }
  // eslint-disable-next-line no-param-reassign
  privateProperties.replacer = value;
}

function setSpace(value, privateProperties) {
  if (!['string', 'number'].includes(typeof value)) {
    throw new TypeError('Value of space property must be string or number.');
  }
  // eslint-disable-next-line no-param-reassign
  privateProperties.space = value;
}

const allowedProperties = { replacer: setReplacer, space: setSpace };

function setProperties(properties, privateProperties) {
  Object.keys(properties).forEach((name) => {
    if (!Object.keys(allowedProperties).includes(name)) {
      throw new TypeError('Name of property is not allowed.');
    }
    allowedProperties[name](properties[name], privateProperties);
  });
}

function convert(data, privateProperties) {
  return JSON.stringify(data, privateProperties.replacer, privateProperties.space);
}

// Constructor
function JsonConverter(properties = {}) {
  const privateProperties = {
    replacer: null,
    space: undefined,
  };

  setProperties(properties, privateProperties);

  const jsonConverter = Object.create(
    Object.defineProperties(
      Object.create(Converter.prototype),
      {
        outputType: {
          value: 'json',
        },
        replacer: {
          get: () => privateProperties.replacer,
          set: value => setReplacer(value, privateProperties),
        },
        space: {
          get: () => privateProperties.space,
          set: value => setSpace(value, privateProperties),
        },
        convert: {
          value: data => convert(data, privateProperties),
        },
      },
    ),
  );

  return jsonConverter;
}

module.exports = { JsonConverter };
