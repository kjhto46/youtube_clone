import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {
    pageTitle: "Join"
});
export const postJoin = async (req, res) => {
    const {
        name,
        username,
        email,
        password,
        password2,
        location
    } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "비밀번호가 서로 일치하지 않습니다."
        });
    }
    const exists = await User.exists({
        $or: [{
            username
        }, {
            email
        }]
    });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "이미 사용중인 아이디입니다."
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req, res) =>
    res.render("login", {
        pageTitle: "Login"
    });

export const postLogin = async (req, res) => {
    const {
        username,
        password
    } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({
        username,
        socialOnly: false
    });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this Username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if ("access_token" in tokenRequest) {
        const {
            access_token
        } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            //set notification 유저가 github를 통해 로그인했으나 verified 된 이메일이 없으니 믿을수 없다고 내용을 추가할수있다.
            return res.redirect("/login");
        }
        let user = await User.findOne({
            email: emailObj.email
        }); //primary하고 verified한 email을 찾았다면 email을 기준으로 유저를 mongoDB에 있는지 확인을 한다.
        if (!user) {
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true, //socialOnly true 로 'const postLogin' 에서 false로 되어있던 값인지 true인지 확인하기 위해 false면 username과 password로 이루워진 유저고 true면 소셜로그인을 한 유저이기 때문
                location: userData.location,
            });
        } //user 값이 없다면 github에서 제공하는 데이터로 추가한다.
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }


};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/")
}; //로그아웃
export const getEdit = (req, res) => {
    return res.render("edit-profile", {
        pageTitle: "Edit Profile"
    });
}

export const postEdit = (req, res) => {
    return res.render("edit-profile");
}

export const see = (req, res) => res.send("See User");