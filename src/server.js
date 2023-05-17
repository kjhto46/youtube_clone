import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import {
  localsMiddleware
} from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({
  extended: true
}));

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: { //만료날짜 설정도 가능하다.
    //   maxAge: 20000,
    // },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL
    }),
  })
);


app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); //uploads라는 라우터를만들고 express.static() 함수는 정적 파일을 제공하는 미들웨어 함수입니다. express.static() 함수를 사용하면 Express.js 애플리케이션에서 정적 파일(이미지, CSS, JavaScript 파일 등)을 서비스할 수 있습니다. 
app.use("/static", express.static("assets"));
//위에 내용을 쉽게 말 하자면 'express로 누군가 /uploads로 가려고 한다면 uploads 폴더의 내용을 보여주라' 라는 뜻
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;