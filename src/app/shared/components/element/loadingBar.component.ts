import {Component, OnInit, Input, ViewChild, AfterViewInit} from '@angular/core';

@Component({
  selector: 'loading-bar',
  templateUrl: '../../../../app/shared/template/page/loadingBar.component.html',
  styleUrls: ['../../../../assets/css/common/loading.css'],
})

export class LoadingBarComponent implements OnInit,AfterViewInit {
  /**
   * 初始化load的属性
   * @param progress
   */
  @Input() set option(option: any) {
    //
  }
  //
  public showLoadingBar : boolean =false;
  public fileCount:number = 1;
  public processPercent:number = 0;

  @ViewChild('progressBar') public progressBar:any;
  @ViewChild('progressNumber') public progressNumber:any;

  constructor() {
    //
  }
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setProcessPercent(0);
  }

  /**
   * 设置滚动条的进度
   * @param percent
   */
  setProcessPercent(percent : number) {
    this.processPercent = percent;
    this.progressBar.nativeElement.style.width = percent+'%';
  }

	/**
   * 隐藏进度
   */
  hideProcessBar() {
    this.showLoadingBar = false;
    this.setProcessPercent(0);
  }

  /**
   * 显示进度
   */
  showProcessBar() {
    this.showLoadingBar = true;
  }
}
