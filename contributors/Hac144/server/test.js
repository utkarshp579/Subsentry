const { getSubscriptions } = require("./spendCalculator");


const res = {
  json: (output) => console.log(JSON.stringify(output, null, 2))
};

getSubscriptions(null, res);
