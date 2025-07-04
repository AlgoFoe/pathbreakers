/* eslint-disable no-unused-vars */

// ====== USER PARAMS
declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
  _id:string;
};

declare type UpdateUserParams = {
  firstName?: string | null;
  lastName?: string;
  username?: string;
  photo?: string;
};
