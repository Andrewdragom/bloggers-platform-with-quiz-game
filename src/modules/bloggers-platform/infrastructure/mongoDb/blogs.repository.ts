import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument } from '../../domain/blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel('blogs') private blogModel: Model<BlogDocument>) {}
  async findBlogs(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm: any,
  ) {
    const filter: any = {};
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }
    const allBlogs = await this.blogModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 });
    return allBlogs;
  }
  async getBlogsCount(searchNameTerm: any) {
    const filter: any = {};
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }
    return await this.blogModel.countDocuments(filter);
  }
  async createNewBlog(newBlog: object) {
    const result = await this.blogModel.create({ ...newBlog });
    return result;
  }
  async findBlogById(id: string | null | undefined) {
    const foundBlog = await this.blogModel.findOne({ id: id });
    return foundBlog;
  }
  async deleteBlogById(id: string | null) {
    const result = await this.blogModel.deleteOne({ id: id });
    if (result.deletedCount === 1) return true;
    else return false;
  }
  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) {
    const result = await this.blogModel.updateOne(
      { id },
      {
        $set: {
          id: id,
          name: name,
          description: description,
          websiteUrl: websiteUrl,
        },
      },
    );
    if (result.matchedCount === 1) return true;
    else return false;
  }
  // async createNewBlog(newBlog: object) {
  //   const result = await BlogsModel.create({ ...newBlog });
  //   return result;
  // }
  // async updateBlogById(
  //   id: string,
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ) {
  //   const result = await BlogsModel.updateOne(
  //     { id },
  //     {
  //       $set: {
  //         id: id,
  //         name: name,
  //         description: description,
  //         websiteUrl: websiteUrl,
  //       },
  //     },
  //   );
  //   if (result.matchedCount === 1) return true;
  //   else return false;
  // }
}
