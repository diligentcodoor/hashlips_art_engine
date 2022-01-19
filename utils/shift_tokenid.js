const fs = require("fs");
const path = require("path");

for (let i = 1; i <= 10000; i++) {
  const file = `build/json/${i}.json`;
  const newFile = `build/json/${i - 1}`;
  console.log(`Changing ${file} ==> ${newFile}`);
  fs.copyFileSync(file, newFile);
  fs.rmSync(file);
}
