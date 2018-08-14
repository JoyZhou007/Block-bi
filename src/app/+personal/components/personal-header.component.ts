import {Component, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'personal-header',
  templateUrl: '../template/personal-header.component.html'
})

export class ComponentHeaderComponent {

  private btnFail: string = '';
  constructor() {}

  @Input() set btnFailData(data: any) {
    if(data && data.msg){
      this.btnFail = data.msg;
      setTimeout(() => {
        this.btnFail = '';
      },3000)
    }
  }

  //save
  @Output() public uploadInfo: any = new EventEmitter();

  /**
   * 保存数据
   * @param element 按钮标签
   */
  saveData(element: any) {
    this.uploadInfo.emit(element);
  }

}