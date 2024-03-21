import { Document } from 'mongoose';

export default interface PermissionDocument extends Document {
  email: string;
  phoneNumber: string;
  contactPerson: string;
  usdot: string;
  name: string;
  address: string;
  timeZone: {
    id: number;
    tzCode: string;
    utc: string;
    label?: string;
    name?: string;
  };
}
