const path = require("path");

module.exports = {
   entry: "./src/client/js/main.js", //entry : "경로에 있는" 파일을 가져오고
   mode: "development",
   output: {
      filename: "main.js", //파일 이름은 이것
      path: path.resolve(__dirname, "assets", "js"), // 변환되서 저장되는 폴더는 이곳
   },
   module: {
      rules: [{
         test: /\.js$/, //모든 javascript 파일들을 가져온다
         use: {
            loader: 'babel-loader',
            options: {
               presets: [
                  ['@babel/preset-env', {
                     targets: "defaults"
                  }]
               ]
            }
         }
      }]
   }
}