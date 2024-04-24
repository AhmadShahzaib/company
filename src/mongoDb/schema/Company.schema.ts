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
const Documents = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true },
    date: { type: Number, required: true },
  },
  
);
export const CompanySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    phoneNumber: { type: String },
    contactPerson: { type: String },
    usdot: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: false },
  companyProfile: { type: Documents, required: false },


    timeZone: { type: TimeZoneSchema, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
