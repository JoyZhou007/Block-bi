import {Component, Inject, Input} from '@angular/core';
@Component({
  selector: 'new-recommendation-request',
  templateUrl: '../../template/message/new-recommendation-request.component.html'
})
export class NewRecommendationRequestComponent {

  public notificationData: any = {};
  public getData: any = {};
  public senderInfo: any = {};
  public objInfo: any = {};
  public notificationTime: string;

  constructor(
    @Inject('app.config') public appConfig: any,
    @Inject('date.service') public dateService: any,
    @Inject('type.service') public typeService: any,
    @Inject('dialog.service') public dialogService: any) {}

  /**
   * 接收数据
   * @param data
   */
  @Input() set setNotification(data: any) {
    if (data) {
      this.notificationData = data;
      this.getData = data.data;
      if(data.hasOwnProperty('obj')) {
        this.objInfo = data.obj;
        this.senderInfo = data.obj.senderInfo;
        this.notificationTime = this.dateService.formatWithTimezone(this.objInfo.ts, 'HH:MM');
      }
    }
  }

  /**
   * 同意推荐好友
   */
  refuseRecommendation() {
    if(!this.getData.handled || this.getData.handled === 0) {
      let settings = {
        mode: '1',
        title: 'RECOMMENDATION ADD FRIEND',
        isSimpleContent: false,
        componentSelector: 'accept-recommendation',
        componentData: this.typeService.clone(this.notificationData),
        buttons: [
          {
            type: 'refuse',
            btnEvent: 'recommendationDialogRefuse',
            mouseEnterEvent: 'refuseRecommendationDialog',
            mouseLeaveEvent: 'refuseRecommendationDialog'
          },
          {
            type: 'accept',
            btnEvent: 'recommendationDialogAccept',
            mouseEnterEvent: 'refuseRecommendationDialog',
            mouseLeaveEvent: 'refuseRecommendationDialog'
          }
        ]
      };
      this.dialogService.openNew(settings);
    }
  }

}
