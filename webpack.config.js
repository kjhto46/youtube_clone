const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/"

module.exports = {
   entry: {
      main: BASE_JS + "main.js",
      videoPlayer: BASE_JS + "videoPlayer.js",
      recorder: BASE_JS + "recorder.js",
      commentSection: BASE_JS + "commentSection.js"
   }, //entry : "경로에 있는" 파일을 가져오고
   mode: "development",
   //watch: true, npm run assets 로 webpack를 실행시키면 계속 할필요없이 변화를 지켜본다.
   plugins: [
      new MiniCssExtractPlugin({
         filename: "css/styles.css",
      })
   ],
   output: {
      filename: "js/[name].js", //파일 이름은 // 이것 [name]으로 entry에 있던 이름으로 따로 세팅 가능
      path: path.resolve(__dirname, "assets"), // 변환되서 저장되는 폴더는 이곳
      clean: true, //clean은 output folder를 build 시작하기전에 clean 해준다
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