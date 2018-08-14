import {Injectable, Inject} from '@angular/core';

@Injectable()
export class WorkerService {
  //浏览器是否支持WORKER机制
  private isSupportWorker: boolean = false;
  //work实例
  private workerList: any = {};

  private WORK_LISTEN = 'worker.js';

  private CHAT_WORK = 'chat';

  constructor(@Inject('app.config') private appConfig: any) {
    this.checkWorker();
  }

  /**
   * 聊天worker
   */
  setChatWorker() {
    if (this.isSupportWorker && !this.workerList[this.CHAT_WORK]) {
      this.workerList[this.CHAT_WORK] = new Worker(this.WORK_LISTEN);
    }
  }


  /**
   * 获取聊天worker
   */
  getChatWorker() {
    this.setChatWorker();

    return this.workerList[this.CHAT_WORK];
  }


  /**
   * 检测浏览器是否支持HTML5 Worker
   */
  checkWorker() {
    if (!this.isSupportWorker && typeof Worker !== 'undefined') {
      this.isSupportWorker = true;
    }
  }

}
