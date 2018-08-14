import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs/Rx';

//上传文件
const flow = require('@flowjs/flow.js/dist/flow');

@Injectable()
export class UploadService {

  //上传图片路径
  private uploadUrl: string = '';

  //上传组件实例
  private _instance: any;
  private postData: any;

  //手动上传Base64 图片
  private progressObserver: any;
  private progress: any;	//手动上传进度

  //事件列表
  private eventList: any = {};

  private UPLOAD_PROGRESS_EVENT: string = 'fileProgress';

  constructor(
    @Inject('app.config') private config: any,
    @Inject('dialog.service') public dialogService: any,
    @Inject('notification.service') public notificationService: any,
  ) {
    if (this.config.requestByDomain) {
      this.uploadUrl = this.config.apiDomain;
    }
  }

  /**
   * 创建上传实例
   */
  newInstance(attrData: any, element: any): any {
    this._instance = null;
    if (attrData) {
      attrData.target = this.uploadUrl + (attrData.uploadUrl ? attrData.uploadUrl : this.config.uploadUrl);
      if (this.postData) {
        attrData.query = this.postData;
      }
      delete attrData.uploadUrl;
      this._instance = new flow(attrData);
      this.selectFile(element);
    }
    return this._instance;
  }

  /**
   * 选择文件
   */
  selectFile(element: any) {
    this._instance.assignBrowse(element, false, false, {});
  }

  /**
   * 设置上传数据
   */
  setUploadData(data: any) {
    this.postData = data;
    if (this._instance) {
      this._instance.opts.query = data;
    }
  }

  /**
   * 上传Base64File
   * @param params
   * @param files
   * @returns {any}
   */
  uploadBase64File(file: any, params: any): Observable<any> {
      Observable.create((observer: any) => {
        this.progressObserver = observer;
      }).share();
      let uploadUrl = this.uploadUrl + (params.uploadUrl ? params.uploadUrl : this.config.uploadUrl);
      delete params.uploadUrl;
        return Observable.create((observer: any) => {
          let formData: FormData = new FormData(),
            xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('POST', uploadUrl, true);

          for (var property in params) {
            formData.append(property, params[property]);
          }

          for (var property in file) {
            formData.append(property, file[property]);
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                observer.next(JSON.parse(xhr.response));
                observer.complete();
              }else{
                if(typeof xhr.response.status == 'undefined'){
                   this.dialogService.openError({simpleContent: 'Upload image failed!'});
                }
              }
            }
          };
          xhr.upload.onprogress = (event) => {
            let progress = event.loaded;
            if (this.eventList[this.UPLOAD_PROGRESS_EVENT]) {
              this.eventList[this.UPLOAD_PROGRESS_EVENT](progress);
            }
          };
          xhr.send(formData);
        });

  }

  /**
   * 绑定事件
   */
  on(eventName: string, callBack: any) {
    if (typeof callBack === 'function') {
      this.eventList[eventName] = callBack;
    }
  }

}
