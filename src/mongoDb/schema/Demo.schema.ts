import * as mongoose from 'mongoose';

const TimeZoneSchema = new mongoose.Schema(
  {
    tzCode: { type: String, required: true },
    utc: { type: String, required: true },
    label: { type: String },
    name: { type: String },
  },
  { _id: false },
);
const Documents = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  date: { type: Number, required: true },
});
export const DemoSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    phoneNumber: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String },
    usdot: { type: String, required: true },
    companyName: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: false },
    companyProfile: { type: Documents, required: false },
    status: { type: String, required: true },
    comments: { type: String, required: false },
    userDetails: { type: {}, required: true },
    timeZone: { type: TimeZoneSchema, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
