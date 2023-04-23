export const localsMiddleware = (req, res, next) => {
    // if(req.session.loggedIn){
    //     res.locals.loggedIn = true
    // }
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "wetube";
    res.locals.loggedInUser = req.session.user || {}; //|| 는 알다시피 or이라는 뜻 session.user가 없으면 {} 빈공간이다 라는 의미
    // console.log(res.locals);
    next();
}