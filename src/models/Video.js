import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 80
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 8
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  meta: {
    views: {
      type: Number,
      default: 0,
      required: true
    },
    rating: {
      type: Number,
      default: 0,
      required: true
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }, //refernce 도 추가해줄 필요가 있다. mongoose에게 owner에 id를 저장하겠다고 알려주는데 어떤 model의 ObjectId를 사용하지는지 알려주기 위해
});

videoSchema.static('formatHashtags', function (hashtags) {
  return hashtags.split(",").map((word) => !word.trim().startsWith("#") ? `#${word.trim()}` : word.trim());
});


const Video = mongoose.model("Video", videoSchema);
export default Video;