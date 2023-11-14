import { Expose } from "class-transformer";
import { Request, Response } from "express";
import { Mapper } from "../../utils/mapper";
import { ApiHelper } from "../../utils/api-helper";
import Logging from "../../utils/logging";
import { ApiErrorCode } from "../../utils/error-codes";
import { Departmant } from "../../utils/enums";
import { UserClient } from "../../clients/user-client";
import { HashingHelper } from "../../utils/hashing-helper";
import { IsNumber, IsString, validate } from "class-validator";
import { MailHelper } from "../../utils/mail-helper";
import { OtpClient } from "../../clients/otp-client";

class PutVerifyRegistirationOtpRequest {
  @Expose()
  @IsString()
  email: string;

  @Expose()
  @IsNumber()
  otp: number;
}

// base endpoint structure
const putVerifyRegistirationOtp = async (req: Request, res: Response) => {
  Logging.info(JSON.stringify(req.query, Object.getOwnPropertyNames(req.query)));
  try {
    const putVerifyRegistirationOtpRequest: PutVerifyRegistirationOtpRequest = Mapper.map(
      PutVerifyRegistirationOtpRequest,
      req.body
    );

    const user = await UserClient.getUserByEmail(putVerifyRegistirationOtpRequest.email);
    if (!user) {
      return ApiHelper.getErrorResponse(res, 403, [
        {
          errorCode: ApiErrorCode.EMAIL_DOES_NOT_EXISTS,
          message: "Email does not exists",
        },
      ]);
    }

    const isValidated = await OtpClient.verifyRegistirationOtp(user!.email, putVerifyRegistirationOtpRequest.otp);

    if (!isValidated) {
      return ApiHelper.getErrorResponse(res, 403, [
        {
          errorCode: ApiErrorCode.OTP_CODE_NOT_VALID,
          message: "Otp code is not valid or outdated",
        },
      ]);
    }
    ApiHelper.getSuccessfulResponse(res, { message: "User successfully verified", user });
  } catch (error) {
    Logging.error(error);

    if (ApiHelper.isInvalidRequestBodyError(error)) {
      return ApiHelper.getErrorResponseForInvalidRequestBody(res);
    }
    ApiHelper.getErrorResponseForCrash(res, JSON.stringify(Object.getOwnPropertyNames(req)));
  }
};

export default putVerifyRegistirationOtp;
