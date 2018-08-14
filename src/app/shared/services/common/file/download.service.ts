import {Injectable, Inject} from '@angular/core';
//const fileSaver = require('filesaver.js');

@Injectable()
export class DownloadService {

  constructor(@Inject('api.service') public api: any) {
  }

  /**
   * 下载文件
   */
  downloadFolderFile(fileIn: any, callback?: Function) {
    this.api.download('folderDownloadFile', fileIn, callback, 'file');
  }


  /**
   * 打开下载路径
   */
  downloadTheFile(url: string) {
    window.open(url);
  }


}
