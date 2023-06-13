import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({
    createdAt: "desc"
  }).populate("owner");
  return res.render("home", {
    pageTitle: "Home",
    videos
  });
};

export const watch = async (req, res) => {
  const {
    id
  } = req.params;
  const video = await Video.findById(id).populate("owner"); // populate는 MongoDB에서 조인과 유사한 동작을 수행하는 Mongoose 메서드입니다. populate() 메서드는 참조 필드에 대한 정보를 가져오는 데 사용됩니다. 지금 같은 경우는 기존에는 owner는 단순한 텍스트였지만, populate를 사용하고 owner를 불러올때는  await User.findById(video.owner); 의 값처럼 정보를 가지고온다.
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video not found."
    });
  }
  return res.render("watch", {
    pageTitle: video.title,
    video,
  });
};

export const getEdit = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    user: {
      _id
    }
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video not found."
    });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "비디오의 작성자가 아닙니다.");
    return res.status(403).redirect("/");
  }
  return res.render("edit", {
    pageTitle: `Edit: ${video.title}`,
    video
  });
};

export const postEdit = async (req, res) => {
  const {
    user: {
      _id
    }
  } = req.session;
  const {
    id
  } = req.params;
  const {
    title,
    description,
    hashtags
  } = req.body;
  const video = await Video.exists({
    _id: id
  });
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video not found."
    });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", {
    pageTitle: "Upload Video"
  });
};

export const postUpload = async (req, res) => {
  const {
    user: {
      _id
    }
  } = req.session;
  const {
    video,
    thumb
  } = req.files;
  const {
    title,
    description,
    hashtags
  } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path, //상단에 있는 video, thumb은 array이기때문에 이렇게 작성
      thumbUrl: thumb[0].path,
      owner: _id, //유저의 'id'를 'video'의 'owner'에 추가 하고있다.
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const {
    id
  } = req.params;
  const {
    user: {
      _id
    }
  } = req.session;
  const video = await Video.findById(id);
  const user = await User.findById(_id);

  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video not found."
    });
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  //비디오 object 삭제
  await Video.findByIdAndDelete(id);
  // db.user 안의 "videos" ID 삭제
  // 방법 1. filter를 사용해서 기존의 배열을 수정하지않고 새로운 배열을 생성하여 할당한다.
  // 1. user.videos 배열에서 filter() 함수로 주어진 함수를 통과하는 모든 요소를 모아 새로운 배열을 만든다.(true인 경우만)
  // 2. String(videoId) !== String(id) 는 각각 'videoId'와 'id'를 문자열로 변환한 후, 두 값이 다를 경우 true를 반환합니다. 이렇게 함으로써 'user.videos' 배열에서 해당하는 'id'를 가진 요소만 제외하게 됩니다.
  // 헷갈렸던 부분인 'videoId'라는 값이 없지 않냐에 대해 말하자면 이것은 배열안에 ObjectId 라고 되어있는부분 id값을 말하는것이다.
  // (예시1번)///////// user.videos = user.videos.filter(videoId => String(videoId) !== String(id));
  // const videoIds = user.videos.map(videoId => String(videoId));
  // console.log(videoIds); 이방법으로 헷갈리던 videoId의 값들을 확인해볼수있을것이다.

  // 방법 2. splice를 사용하고 기존의 배열에서 특정요소를 제거하는 방법
  // user.videos 배열에서 indexOf 를 사용하여 삭제할 요소의 인덱스를 찾은 다음 splice를 사용하여 해당 인덱스의 요소를 삭제 1 이라는것은 배열에서 id 값과 일치하는 요소를 찾아서 해당 요소를 1개만큼 삭제하는 것을 의미
  user.videos.splice(user.videos.indexOf(id), 1);
  await user.save();

  return res.redirect("/");
};

export const search = async (req, res) => {
  const {
    keyword
  } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`${keyword}$`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", {
    pageTitle: "Search",
    videos
  });
};

export const registerView = async (req, res) => {
  const {
    id
  } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    //
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
}

export const createComment = async (req, res) => {
  const {
    session: {
      user
    },
    body: {
      text
    },
    params: {
      id
    },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  })
  return res.sendStatus(201);
};