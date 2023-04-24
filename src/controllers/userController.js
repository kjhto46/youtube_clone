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
            errorMessage: "존재하지 않는 아이디 입니다.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "비밀번호가 일치하지 않습니다.",
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

// export const postEdit = async (req, res) => {
//     const {
//         session: {
//             user: {
//                 _id
//             }
//         },
//         body: {
//             name,
//             email,
//             username,
//             location
//         }
//     } = req;

//     const findUsername = await User.findOne({
//         username
//     });
//     const findEmail = await User.findOne({
//         email
//     });
//     if (findUsername != null && findUsername._id != _id) {
//         return res.render("edit-profile", {
//             pageTitle: "Edit  Profile",
//             errorMessage: "이미 등록된 Username 입니다.",
//         });
//     } else if (findEmail != null && findEmail._id != _id) {
//         return res.render("edit-profile", {
//             pageTitle: "Edit  Profile",
//             errorMessage: "이미 등록된 이메일입니다.",
//         });
//     }
//     const updatedUser = await User.findByIdAndUpdate(_id, {
//         name,
//         email,
//         username,
//         location
//     }, {
//         new: true
//     });
//     req.session.user = updatedUser;

//     return res.redirect("/users/edit");
// }
export const postEdit = async (req, res) => {
    const {
        session: {
            user: {
                _id
            },
        },
        body: {
            name,
            email,
            username,
            location
        },
    } = req;

    try {
        const updatedUser = await User.findByIdAndUpdate( //findByIdAndUpdate 망고db에 지원하는 함수 이름처럼 "id를 찾아서 업데이트" 이기때문에 id를 먼저 기입 그후 UpdateQuery 작성 callback으로 할수있지만 우리는 awiat를 사용
            _id, {
                name,
                email,
                username,
                location,
            }, {
                new: true
            }
        ); // mongoDB에는 업데이트가 되었지만 session.user에는 업데이트가 안되어 값이 동일하게 보이게 된다. 이부분을 해결해보겠다.
        req.session.user = updatedUser; //updatedUser을  req.session.user로 덧씌우기 작업이다.
        res.redirect("/users/edit");
    } catch (error) {
        console.log(error);
        if (error.code === 11000) { // 상단의 console.log(error)를 통해 어느부분에서 error가 발생하는지 확인 code:11000,으로 keyValue:{}로 오류를 알려준다.
            if (error.keyValue.username) { //keyValue: { username: 'test' } 이렇게 오류가 나타나기에 error.keyValue.username으로 작성후 edit-profile로 status(400)로 보내면서 각자에 맞는 errorMessage를 보낸다. 
                return res.status(400).render("edit-profile", {
                    pageTitle: "Edit Profile",
                    errorMessage: "이미 사용중인 유저명입니다.",
                });
            }
            if (error.keyValue.email) {
                return res.status(400).render("edit-profile", {
                    pageTitle: "Edit Profile",
                    errorMessage: "이미 사용중인 이메일입니다.",
                });
            }
        }
        return res.status(400).render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "업데이트에 실패하였습니다. 다시시도해주세요.",
        });
    }
};

export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        return res.redirect("/");
    }
    return res.render("users/change-password", {
        pageTitle: "Change Password"
    })
};
export const postChangePassword = (req, res) => {
    //send notification
    return res.redirect("/");
};
export const see = (req, res) => res.send("See User");