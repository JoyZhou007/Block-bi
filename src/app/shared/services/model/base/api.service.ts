import 'rxjs/add/operator/map';
import {Injectable, Inject} from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';

import {BlockBiRequest} from '../../../config/app.config';
import {WindowRef} from "../../../../WindowRef";
import {Observable} from "rxjs/Observable";


@Injectable()
export class ApiService{

  private requestUrl: string = '';
  private requestData: string = '';
  private responseDataType: string = 'json';
  private httpHeader: Headers;
  private biRequest: BlockBiRequest;

  private USER_SESSION_ID: string = 'session_id';
  private sessionId: any;

  constructor(public http: Http,
              @Inject('store.service') private store: any,
              @Inject('user-data.service') private userDataService: any,
              @Inject('page-status.service') private pageStatus: any,
              @Inject('dialog.service') private dialogService: any,
              @Inject('app.config') private config: any) {
    this.httpHeader = new Headers();
    this.biRequest = new BlockBiRequest();
    this.httpHeader.append('Content-Type', 'application/x-www-form-urlencoded');
    //this.httpHeader.append('Content-Encoding', 'gzip');
  }

  public initSession() {
    this.sessionId = this.userDataService.getSessionId();
  }

  public setRequestUrl(apiName: string) {
    this.requestUrl = '';
    if (this.biRequest.IS_REQUEST_BY_DOMAIN) {
      this.requestUrl = this.biRequest.TARGET_DOMAIN;
    }
    if (this.biRequest.PROXY_DATA[apiName]) {
      this.requestUrl += '/' + this.biRequest.PROXY_DATA_PREFIX
        + '/' + this.biRequest.PROXY_DATA[apiName];
    } else {
    }
    return this.requestUrl;
  }

  /**
   * 设置请求参数
   * @param data
   */
  public setRequestData(data: any) {
    this.requestData = '';
    //初始化Session
    this.initSession();
    let urlSearchParams = new URLSearchParams();
    if (data !== null && data) {
      for (let key in data) {
        //let value: any = '';
        if (data.hasOwnProperty(key)) {
          if (typeof data[key] === 'object') {
            urlSearchParams.append(key, JSON.stringify(data[key]));
            //value = JSON.stringify(data[key]);
          } else {
            urlSearchParams.append(key,  data[key]);
            // value = data[key];
          }
        }
        //this.requestData += (this.requestData ? '&' : '') + key + '=' + value;
      }
    }

    if (this.sessionId) {
      urlSearchParams.append(this.USER_SESSION_ID, this.sessionId);
      // this.requestData += (this.requestData ? '&' : '')
      //   + this.USER_SESSION_ID + '=' + this.sessionId;
    }
    let body = urlSearchParams.toString();
    this.requestData = body;
  }

  /**
   * 发送GET请求
   * @param apiName
   * @param data
   * @param callback
   * @param responseDataType
   * @returns {any}
   */
  public get(apiName: string, data?: any, callback?: any, responseDataType?: any): any {
    this.setRequestUrl(apiName);

    //请求发送的数据
    this.setRequestData(data);

    //返回的数据类型
    if (responseDataType) {
      this.responseDataType = responseDataType;
    }
    if (this.requestData !== '') {
      this.requestUrl += '?' + this.requestData;
    }

    //let response = this.response(this.http.get(this.requestUrl, new RequestOptions({headers: this.httpHeader, withCredentials: true})));
    let response = this.response(this.http.get(this.requestUrl));

    if (typeof callback === 'function') {	//如果是回调函数
      return response.subscribe((data: any) => {
        this.dealPageCommonStatus(data, callback);
      });
    } else {
      return response;
    }
  }

  /**
   *
   * @param apiName
   * @param data
   * @param callback
   */
  public download(apiName: string, data?: any, callback?: Function) {
    try {
      this.setRequestUrl(apiName);
      this.setRequestData(data);
      if (this.requestData !== '') {
        this.requestUrl += '?' + this.requestData;
      }
      if (typeof callback === 'function') {
        let response = this.response(this.http.get(this.requestUrl));
        callback(response);
      } else {
        window.open(this.requestUrl);
      }

    } catch (e) {
      return
    }

  }


  /**
   * 发送POST请求
   * @param apiName
   * @param data
   * @param callback
   * @param responseDataType
   * @returns {*}
   */
  public post(apiName: string, data?: any, callback?: any, responseDataType?: any): any {
    this.setRequestUrl(apiName);
    //请求发送的数据
    this.setRequestData(data);

    //返回的数据类型
    if (responseDataType) {
      this.responseDataType = responseDataType;
    }
    let response = this.response(
      this.http.post(this.requestUrl, this.requestData, new RequestOptions({headers: this.httpHeader}))
    );
    if (typeof callback === 'function') {	//如果是回调函数
      response.subscribe((data: any) => {
        //添加调试参数
        if (this.config.debug) {
          console.info('**request api:' + apiName + '**', data);
        }
        this.dealPageCommonStatus(data, callback);
      });
    } else {
      return response;
    }

  }

  /**
   * 处理公用状态
   */
  dealPageCommonStatus(data: any, callback: any) {
    if (data.status !== 1) {		//操作没通过
      this.pageStatus.dealPageStatus(data, this.requestUrl, () => {
        callback(data);
      });
    } else {
      callback(data);
    }
  }


  /**
   * 处理返回数据的类型
   * @param httpRequest 请求实例
   */
  public response(httpRequest: any): any {
    let response: any;
    if (this.responseDataType === 'json') {
      response = httpRequest.map(res => res.json())  // could raise an error if invalid JSON
        .do(data => {})  // debug
        .catch((err) => this._serverError(err));
      //response = httpRequest.map((res: any) => res.json());
    } else if (this.responseDataType === 'text') {
      response = httpRequest.map(res => res.text())  // could raise an error if invalid JSON
        .do(data => {})  // debug
        .catch((err) => this._serverError(err));
      //response = httpRequest.map((res: any) => res.text());
    } else if (this.responseDataType === 'file') {
      response = httpRequest;
    }
    return response;
  }

  /**
   * 处理接口错误数据
   * @param err
   * @returns {any}
   * @private
   */
  private _serverError(err: any) {
    if (err instanceof Response) {
      this.dialogService.openError({
        simpleContent: 'request: <b>' + this.requestUrl + '</b> failed. <br> Status:' + err.status + ', Error Msg:' + err.statusText
      });
      return Observable.throw('backend server error, ' + 'error: ' + err.status + ', errorMsg:' + err.statusText);
      // return {status: 0, data: {}, message: 'test12312321'};
      // if you're using lite-server, use the following line
      // instead of the line above:
      //return Observable.throw(err.text() || 'backend server error');
    } else if (err instanceof SyntaxError){
      this.dialogService.openError({
        simpleContent: 'request: <b>' + this.requestUrl + '</b> failed. <br> Detail:' +  err.message
      });
      return Observable.throw(err.message || 'backend server error');
    }
    return Observable.throw(err || 'backend server error');
  }

  /**
   * 模拟表单提交
   * @param apiName
   * @param requestData
   * @param callback
   */
  ajaxFormSend(apiName: string, requestData: any, callback: Function){
    let url = this.setRequestUrl(apiName);
    let request = new XMLHttpRequest();
    let self = this;
    request.onreadystatechange = function() {
      if (request.readyState == XMLHttpRequest.DONE) {
        if (callback) {
          if (ApiService.IsJsonString(request.responseText)) {
            callback(JSON.parse(request.responseText))
          } else {
            self.dialogService.openError({
              simpleContent: 'request: <b>' + url + '</b> failed.'
            });
          }

        }
      }
    };
    request.open("POST", url);
    requestData.append(this.USER_SESSION_ID, this.sessionId);
    request.send(requestData);
  }

  /**
   * 是否为合法JSON字符串
   * @param str
   * @return {boolean}
   * @constructor
   */
  static IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
