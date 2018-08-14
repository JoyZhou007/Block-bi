import {Directive, Inject, HostListener, ElementRef,
    EventEmitter, Input, OnInit, ContentChild, AfterContentInit, Output} from '@angular/core';

@Directive({
  selector: '[selectDate]'
})
export class SelectDateDirective implements OnInit,AfterContentInit {

  public click : any = new EventEmitter();
  public isContentInit : boolean = false;
  public dateOptions : any = {
    inputElement : this.element.nativeElement,
    defaultDate : null,
    setEvent : (date: any) => {
      this.afterSelectDate.emit( date );
    }
  };
  /**
   * 单选一天input传入的参数
   *{
      setEvent : (date : any) => {},  //回调函数
      date:{
        selected:this.found_date,   //日历选中时间 ，位置
        top:'',      //日历top值
        left:''     //日历left值
      },
    }
   *
   */
  @ContentChild('selectTime') public selectTime:any;

  @HostListener('click', ['$event'])
  onClick(event : any) {
    event.stopPropagation();
    this.dateOptions.date.top = event.target.offsetTop + event.target.offsetHeight + 'px';
    this.dateOptions.date.left = event.target.offsetLeft + 'px';
    this.dateOptions.date.selected = this.selectTime.nativeElement.value;
    this.click.emit(event);
  }

  @Input() set setDateOption(option:any) {
    this.typeService.mergeObj(this.dateOptions, option);
    if(this.dateOptions.type === 2) {
      this.dateOptions.defaultDate = {};
    }
  }

  @Output() public afterSelectDate : EventEmitter<any> = new EventEmitter();

  constructor(
      public element: ElementRef,
      @Inject('notification.service') public notificationService : any,
      @Inject('type.service') public typeService:any
  ) {
  }

  ngAfterContentInit() {
    this.dateOptions.date.isElShow = true;
    if(!this.isContentInit) {
      this.isContentInit = true;
      this.resetDate();
    }
  }
  resetDate() {
    if(this.isContentInit) {
      this.dateOptions.date.selected = this.selectTime.nativeElement.value;
    }
  }

  //初始化页面后
  ngOnInit() {
    this.click.subscribe((event : any) => {
      this.resetDate();
      this.openDateForm();
    });
  }

  openDateForm() {
    //点击事件后，发出notification 通知，将option传入全局显示组件
    this.notificationService.postNotification({
      act : this.notificationService.config.ACTION_GLOBAL_COMPONENT_SHOW,
      data: {
        selector:'bi-calendar',
        options: this.dateOptions
      }
    });
  }
}
