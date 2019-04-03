const { Converter } = require('./Converter');

function setReplacer(value, privateProperties) {
  if (!['function', 'undefined'].includes(typeof value) && value !== null && !Array.isArray(value)) {
    throw new TypeError('Value of #replacer" property must be function, array, null or undefined.');
  }
  // eslint-disable-next-line no-param-reassign
  privateProperties.replacer = value || null;
}

function setSpace(value, privateProperties) {
  if (!['string', 'number', 'undefined'].includes(typeof value) && value !== null) {
    throw new TypeError('Value of #space property must be string, number, null or undefined.');
  }
  // eslint-disable-next-line no-param-reassign
  privateProperties.space = value || null;
}

const allowedProperties = { replacer: setReplacer, space: setSpace };

function setProperties(properties, privateProperties) {
  Object.keys(properties).forEach((name) => {
    if (!Object.keys(allowedProperties).includes(name)) {
      throw new TypeError(`"${name}" is not a name of property.`);
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
    space: null,
  };

  setProperties(properties, privateProperties);

  const jsonConverter = Object.seal(
    Object.create(
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
    ),
  );

  return jsonConverter;
}

module.exports = { JsonConverter };
