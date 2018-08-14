import {Component, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'company-header',
  templateUrl: '../template/company-header.component.html'
})

export class ComponentHeaderComponent{

  public couldEdit: boolean = false;
  private btnFail: string = '';
  constructor() {}

  @Output() public parentSaveData = new EventEmitter();

  @Input() public set setCouldEdit(data: boolean) {
    this.couldEdit = data;
  }

  @Input() public set btnFailData(data: any) {
    if(data && data.msg){
      this.btnFail = data.msg;
      setTimeout( () => {
        this.btnFail = '';
      },2000);
    }
  }

  /**
   * 保存数据
   * @param element 按钮标签
   */
  saveData(element: any) {
    this.parentSaveData.emit(element);
  }
}