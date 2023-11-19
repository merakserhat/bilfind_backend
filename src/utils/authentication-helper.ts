import { Request, Response, NextFunction } from "express";
import { ApiHelper } from "./api-helper";
import { verify, sign } from "jsonwebtoken";
import Logging from "./logging";
import { UserClient } from "../clients/user-client";
import { User } from "../models/user-model";
import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import { Mapper } from "./mapper";

const SECRET_KEY = process.env.SECRET_KEY;

export class RequestLocals {
    user: User | null | undefined
}

export const generateAuthenticationToken = (user: User) => {
    if (!SECRET_KEY) {
        Logging.error("SECRET_KEY not found!")
        return "";
    }

    const token = sign(
        {
          user_id: user._id,
          email: user.email,
        },
        SECRET_KEY,
        {
          expiresIn: "1y", //TODO: expires in one day it can be change
        }
      );

      return token;
}

class AuthenticationTokenMetadata {
    @Expose()
    @IsString()
    email: string;
  
    @Expose()
    @IsString()
    user_id: string;
  } 

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
   try {
    const token = req.headers["authorization"];

    if (!SECRET_KEY) {
        Logging.error("SECRET_KEY not found!")
        return ApiHelper.getErrorResponseForUnauthorized(res);
    }

    if (!token) {
        return ApiHelper.getErrorResponseForUnauthorized(res);
    }

    const bearerToken = token.split(" ")[1];
    const decodedToken = verify(bearerToken, SECRET_KEY);
    const tokenMetadata: AuthenticationTokenMetadata = Mapper.map(AuthenticationTokenMetadata, decodedToken);

    const user = await UserClient.getUserById(tokenMetadata.user_id);
    const locals: RequestLocals = {
        user: user
    }

    // @ts-ignore
    req.locals = locals;

    next();
   } catch (error) {
    return ApiHelper.getErrorResponseForUnauthorized(res);
   }
};
