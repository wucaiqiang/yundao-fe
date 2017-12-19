export default obj => {
  let dictionary = [],
    enums = {},
    keyValue = {};

  for (let item in obj) {
    dictionary.push(obj[item]);
    enums[item] = obj[item].value;
    keyValue[obj[item].value] = obj[item].text;
  }

  return { dictionary, enum: enums, keyValue };
};
