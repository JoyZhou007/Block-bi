import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FolderModelService } from "../../shared/services/model/folder-model.service";
import { Router } from "@angular/router";

@Component({
  selector: 'space-control',
  templateUrl: '../template/space.component.html',
  styleUrls: ['../../../assets/css/space/space.css'],
  encapsulation: ViewEncapsulation.None
})

export class SpaceComponent implements OnInit {

  public staffList: Array<any> = [];
  public searchText: string = '';
  private pipeData: any;
  //总容量
  public totalArr: Array<any>;
  //five 用户用量
  public fiveDataArr: Array<any>;

  constructor(public folderModelService: FolderModelService,
              public router: Router,
              @Inject('bi-translate.service') public translateService: any,
              @Inject('app.config') public config: any,
              @Inject('dialog.service') public dialogService: any) {
  }

  ngOnInit() {
    this.getStaffSpace();
    this.getPipeData();
  }

  getStaffSpace() {
    this.folderModelService.staffSpace({}, (res: any) => {
      if (res.status === 1) {
        this.staffList = Array.isArray(res.data) ? res.data : [];
      } else {
        this.dialogService.openError({simpleContent: 'fetch staff space failed!'});
      }
    });

  }


  closeSpace(event) {

  }

  /**
   * 取消
   * @param event
   */
  onCloseSearch(event: any) {
    if (event) {
      event.stopPropagation()
    }
    this.searchText = '';
  }

  /**
   * 获取画图的数据
   */
  private getPipeData(): void {
    this.folderModelService.drawTopFivePipe({}, (res: any) => {
      if (res.status === 1) {
        if (res.data.hasOwnProperty('top_five')
          && res.data.hasOwnProperty('consumption_size')
          && res.data.hasOwnProperty('left_size')) {
          let fiveArr = res.data.top_five;
          if (!Array.isArray(fiveArr)) {
            fiveArr = [];
          }
          this.totalArr = [];
          this.totalArr.push(
            [this.translateService.manualTranslate('consumption'), res.data.consumption_size]
          );
          this.totalArr.push(
            [this.translateService.manualTranslate('rest'), res.data.left_size]
          );
          let fiveSum = 0;
          this.fiveDataArr = fiveArr.map((value) => {
            fiveSum += value.size;
            return [value.user_info.p_name, value.size];
          });
          //其他用量
          if (fiveArr.length === 5) {
            let otherData = [this.translateService.manualTranslate('other'), res.data.consumption_size - fiveSum];
            if (fiveArr.length) {
              this.fiveDataArr.push(otherData);
            }
          }

        }

      } else {
        this.dialogService.openError({simpleContent: res.message});
      }
    });
  }


}
