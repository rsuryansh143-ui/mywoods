import mongoose from "mongoose";

const woodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["hardwood", "softwood", "engineered", "other"],
    },
    origin: {
      type: String,
      default: "Unknown",
    },
    color: {
      type: String,
      default: "natural",
    },
    density: {
      type: Number,
      default: 0,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Wood", woodSchema);
