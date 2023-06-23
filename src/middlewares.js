import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

const multerUploader = multerS3({
    s3: s3,
    bucket: 'kjhwetube',
    acl: 'public-read',
})

export const localsMiddleware = (req, res, next) => {
    // if(req.session.loggedIn){
    //     res.locals.loggedIn = true
    // } 
    res.locals.loggedIn = Boolean(req.session.loggedIn); //Boolean() req.session.loggedIn 값이 확인되면 (true) (로그인되있다면) request를 계속한다.
    res.locals.siteName = "wetube";
    res.locals.loggedInUser = req.session.user || {}; //|| 는 알다시피 or이라는 뜻 session.user가 없으면 {} 빈공간이다 라는 의미
    next();
}
// 로그인을 하지 않은 사람들이 우리가 보호하려는 페이지에 가는걸 막기 위해
export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "로그인을 해주십시오.");
        return res.redirect("/login");
    }
}
// 로그인 한 사람들이 보호하는 페이지에 가는걸 막기 위한것
export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "승인되지 않았습니다.");
        return res.redirect("/");
    }
};

export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    },
    storage: multerUploader,
}); //multer라는 middleware로 이미지에 대한 정보를 저장

export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 20000000,
    },
    storage: multerUploader,
});