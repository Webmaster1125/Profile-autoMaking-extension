
const fs = require('fs');

// const pro = require("./abc/2.js");

let pro = {};

const ab = fs.readdirSync("abc");

console.log(ab);

for (i = 0; i < ab.length; i++) {

  pro = require(`./abc/${ab[i]}`);

  const content = JSON.stringify(pro);

  try {
    fs.writeFileSync("profiles/" + pro.name + '.txt', content)
    console.log("succeed");
  } catch (err) {
    console.error("failed")
  }
}