import { Expose, Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import { ObjectId } from "mongodb";
import { User } from "./user-model";
import { Mapper } from "../utils/mapper";
import { Departments } from "../utils/enums";

export enum PostType {
  SALE = "SALE",
  BORROW = "BORROW",
  DONATION = "DONATION",
  FOUND = "FOUND",
  REQUEST = "REQUEST",
  LOST = "LOST",
}

export class PostModel {
  @Transform((value) => value.obj._id.toString())
  @Expose()
  _id?: ObjectId;

  @Expose()
  userId: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  images?: string[];

  @Expose()
  price?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  isDeleted: boolean;

  @Expose()
  @IsEnum(PostType)
  type: PostType;
}

export class PostResponseDTO {
  @Expose()
  id: String;

  @Expose()
  userId: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  images?: string[];

  @Expose()
  price?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  @IsEnum(PostType)
  type: PostType;

  @Expose()
  ownerPhoto?: string;

  @Expose()
  ownerName: string;

  @Expose()
  ownerEmail: string;

  @Expose()
  ownerDepartment: Departments;
}

export const mapToPostResponseDTO = (postModel: PostModel, user: User): PostResponseDTO => {
  return Mapper.map(PostResponseDTO, {
      ...postModel,
      id: postModel._id!.toString(),
      ownerPhoto: user.profilePhoto,
      ownerName: user.name + " " + user.familyName,
      ownerDepartment: user.departmant,
      ownerEmail: user.email,
  });
}
