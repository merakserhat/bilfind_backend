import { Request, Response } from "express";
import { ApiHelper } from "../../utils/api-helper";
import Logging from "../../utils/logging";
import { User } from "../../models/user-model";
import { PostClient } from "../../clients/post-client";
import { PostModel, PostResponseDTO, mapToPostResponseDTO } from "../../models/post-model";
import { ReportModel, mapToReportResponseDTO } from "../../models/report-model";
import { ReportClient } from "../../clients/report-client";

// base endpoint structure
const getUserReportsHandler = async (req: Request, res: Response) => {
  Logging.info(JSON.stringify(req.query, Object.getOwnPropertyNames(req.body)));
  try {
    // @ts-ignore
    const locals = req.locals;
    const user: User = locals.user;

    const reports: ReportModel[] = await ReportClient.getReportsByIdList(user.ownReportIds);

    const postIdList = [...reports].map((report) => report.postId);
    const posts = await PostClient.getReportedPost(postIdList);
    const postMap: Record<string, PostModel> = {};
    posts.forEach((post) => (postMap[post._id!.toString()] = post));

    const postDTOMap: Record<string, PostResponseDTO> = {};
    posts.forEach((post) => (postDTOMap[post._id!.toString()] = mapToPostResponseDTO(post, user)));

    const reportsDTOList = reports.map((report) => mapToReportResponseDTO(report, postDTOMap[report.postId]));

    return ApiHelper.getSuccessfulResponse(res, { reports: reportsDTOList });
  } catch (error) {
    Logging.error(error);

    if (ApiHelper.isInvalidRequestBodyError(error)) {
      return ApiHelper.getErrorResponseForInvalidRequestBody(res);
    }
    ApiHelper.getErrorResponseForCrash(res, JSON.stringify(Object.getOwnPropertyNames(req)));
  }
};

export default getUserReportsHandler;
