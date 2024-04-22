import { Document } from 'mongoose';
export type Documents = {
  name?: string;
  date?: number;
  key?: string;
};
export default interface PermissionDocument extends Document {
  email: string;
  phoneNumber: string;
  contactPerson: string;
  usdot: string;
  name: string;
  address: string;
  driverProfile?: Documents;
  documents?: Documents[];
  timeZone: {
    id: number;
    tzCode: string;
    utc: string;
    label?: string;
    name?: string;
  };
}
