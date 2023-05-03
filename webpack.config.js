const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
   entry: "./src/client/js/main.js", //entry : "경로에 있는" 파일을 가져오고
   mode: "development",
   plugins: [
      new MiniCssExtractPlugin({
         filename: "css/styles.css",
      })
   ],
   output: {
      filename: "js/main.js", //파일 이름은 이것
      path: path.resolve(__dirname, "assets"), // 변환되서 저장되는 폴더는 이곳
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
      }, {
         test: /\.scss$/,
         use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //webpack은 역순으로 시작되기때문에 역순으로 작성함
      }]
   }
}