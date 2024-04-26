import { Document } from 'mongoose';
export type Documents = {
  name?: string;
  date?: number;
  key?: string;
};
export default interface DemoDocument extends Document {
  email: string;
  phoneNumber: string;
  contactPerson: string;
  usdot: string;
  name: string;
  address: string;
  companyProfile?: Documents;
  userDetails : {};
  status: string;
  comments?:  string;
  documents?: Documents[];
  timeZone: {
    id: number;
    tzCode: string;
    utc: string;
    label?: string;
    name?: string;
  };
}
