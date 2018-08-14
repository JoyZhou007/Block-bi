import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class FolderModelService extends BaseModelService {
  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  //初始化文件管理器
  folderInit(data: any, callback?: any) {
    this.getData('folderInit', data, callback);
  }

//  获取文件列表
  folderLists(data: any, callback?: any) {
    this.getData('folderLists', data, callback);
  }

  //  创建文件夹
  folderCreate(data: any, callback?: any) {
    this.getData('folderCreate', data, callback);
  }

  //  删除文件或者文件夹
  deleteFolder(data: any, callback?: any) {
    this.getData('deleteFolder', data, callback);
  }

  //  移动文件或者文件夹
  modifyFolder(data: any, callback?: any) {
    this.getData('modifyFolder', data, callback);
  }

  //  下载文件
  downloadFile(data: any, callback?: any) {
    this.getData('downloadFile', data, callback);
  }

  //  上传文件
  uploadFile(data: any, callback?: any) {
    this.getData('uploadFile', data, callback);
  }

  //  获取全部文件夹列表
  folderDirList(data: any, callback?: any) {
    this.getData('folderDirList', data, callback);
  }

//  获取上层文件列表
  folderTopLists(data: any, callback?: any) {
    this.getData('folderTopLists', data, callback);
  }

//  复制文件
  folderCopy(data: any, callback?: any) {
    this.getData('folderCopy', data, callback);
  }

  //给文件增加或者删除标记
  folderStarred(data: any, callback?: any) {
    this.getData('folderStarred', data, callback);
  }

  //文件重命名
  folderRename(data: any, callback?: any) {
    this.getData('folderRename', data, callback)
  }

//  转让文件owner
  folderTransfer(data: any, callback?: any) {
    this.getData('folderTransfer', data, callback)
  }

  //文件分享
  folderShare(data: any, callback?: any) {
    this.getData('folderShare', data, callback)
  }

//  文件上传
  fileUpload(data: any, callback?: any) {
    this.getData('fileUpload', data, callback)
  }

  //表单上传文件
  newFileUpload(data: any, callback: any) {
    this.api.ajaxFormSend('fileUpload', data, callback);
  }


// 文件搜索
  fileSearch(data: any, callback?: any) {
    this.getData('fileSearch', data, callback)
  }

  // 文件转发
  fileForward(data: any, callback?: any) {
    this.getData('fileForward', data, callback)
  }

// 获取文件share
  fileShareList(data: any, callback?: any) {
    this.getData('fileShareList', data, callback)
  }

  // fileImport
  fileImport(data: any, callback?: any) {
    this.getData('fileImport', data, callback)
  }

//  folderDisk
  folderDisk(data: any, callback?: any) {
    this.getData('folderDisk', data, callback)
  }

//  staffSpace
  staffSpace(data: any, callback?: any) {
    this.getData('staffSpace', data, callback)
  }

  //分享文件列表
  shareFolderList(data: any, callback?: any) {
    this.getData('shareFolderList', data, callback)
  }


  //获取搜索的全路径
  folderFullPath(data: any, callback?: any) {
    this.getData('folderFullPath', data, callback)
  }


  //空间管理
  drawTopFivePipe(data: any, callback?: any) {
    this.getData('drawPipe', data, callback)
  }

}

