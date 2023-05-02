const path = require("path");

module.exports = {
   entry: "./src/client/js/main.js", //entry : "경로에 있는" 파일을 가져오고
   output: {
      filename: "main.js", //파일 이름은 이것
      path: path.resolve(__dirname, "assets", "js"), // 변환되서 저장되는 폴더는 이곳
   }
}