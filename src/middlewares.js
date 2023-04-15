export const localsMiddleware = (req, res, next) => {
    // if(req.session.loggedIn){
    //     res.locals.loggedIn = true
    // }
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "wetube";
    res.locals.loggedInUser = req.session.user;
    console.log(res.locals);
    next();
}