import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* AUTH */
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    /* PROFILE */
    bio: {
      type: String,
      default: "",
      maxlength: 160, // Instagram-like bio limit
    },

    profile_picture: {
      type: String,
      default: "https://placehold.co/400",
    },

    cover_photo: {
      type: String,
      default: "https://placehold.co/1200x400",
    },

    location: {
      type: String,
      default: "",
    },

    /* SOCIAL GRAPH */
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* ACCOUNT STATUS */
    isVerified: {
      type: Boolean,
      default: false,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }
    
    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
    })
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
    })
}

userSchema.methods.generateTemporaryToken = function(){
    const unHashedToken= crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")
    
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    return {hashedToken,unHashedToken, tokenExpiry};
}



export const User = mongoose.model("User", userSchema);
