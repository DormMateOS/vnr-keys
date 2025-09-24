import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["faculty", "security", "admin"],
        required: true,
      },
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "key_taken",
        "key_returned",
        "batch-return",
        "key_reminder",
        "key_summary",
        "security_alert",
        "system",
        "general",
      ],
      default: "general",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Auto-delete after 7 days
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      },
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// Indexes
notificationSchema.index({ "recipient.userId": 1, createdAt: -1 });
notificationSchema.index({ "recipient.role": 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function () {
  this.read = false;
  this.readAt = null;
  return this.save();
};

// Static methods
notificationSchema.statics.findUnreadForUser = function (userId) {
  return this.find({
    "recipient.userId": userId,
    read: false,
    isActive: true,
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.findForUser = function (userId, options = {}) {
  const query = {
    "recipient.userId": userId,
    isActive: true,
  };

  if (options.read !== undefined) {
    query.read = options.read;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

notificationSchema.statics.countUnreadForUser = function (userId) {
  return this.countDocuments({
    "recipient.userId": userId,
    read: false,
    isActive: true,
  });
};

notificationSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [{ expiresAt: { $lt: new Date() } }, { isActive: false }],
  });
};

notificationSchema.statics.deactivateNotification = function (notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { isActive: false },
    { new: true }
  );
};

export const Notification = mongoose.model("Notification", notificationSchema);
