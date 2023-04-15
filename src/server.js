import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRounter from "./routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug")
app.set("views", process.cwd() + "/src/views")
app.use(logger);
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: "Hello!",
        resave:true,
        saveUninitialized:true,
    })    
)

app.use("/", rootRouter)
app.use("/users", userRounter)
app.use("/videos", videoRouter)

export default app