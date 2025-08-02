// Define the structure of the user object
interface CustomUser {
  id: string;
  email: string;
}

declare namespace Express {
  export interface Request {
    user: CustomUser;
  }
}
