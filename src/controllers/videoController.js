import Video from "../models/Video";
import User from "../models/User";

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({
    createdAt: "desc"
  });
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
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video not found."
    });
  }
  return res.render("edit", {
    pageTitle: `Edit: ${video.title}`,
    video
  });
};

export const postEdit = async (req, res) => {
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
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
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
    path: fileUrl
  } = req.file; //multer는 req.file을 제공해주는데 그 file안에는 path가 있다.
  const {
    title,
    description,
    hashtags
  } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl, //fileUrl을 model/video안 'videoSchema'에 만들어둬야한다.
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
  await Video.findByIdAndDelete(id);
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
    });
  }
  return res.render("search", {
    pageTitle: "Search",
    videos
  });
};