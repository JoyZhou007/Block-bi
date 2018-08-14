import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,HostListener
} from "@angular/core";
import {MissionModelService} from "../shared/services/model/mission-model.service";
@Component({
  selector: 'bi-calendar-select',
  styleUrls: ['../../assets/css/date/date.css'],
  templateUrl: './calendar-select.component.html',
  providers: [MissionModelService],
  encapsulation: ViewEncapsulation.None
})

export class CalendarSelectComponent implements OnInit{
  // public isShowCalendar = true;
  public monthList:Array<any> = [];  //第一个循环显示的数组
  public dayList:Array<any> = [];//第二个循环显示的数组
  public settings: any = {    //显示数组中每一项
    number: '',  //内容
    selected: false, //是否选中
  };
  private outputData: any = {}; //输出对象
  //保存可选参数值
  public titleTop:string ='Month';
  public titleBottom:string ='Day';
  private isHourMinute: boolean = false;
  private topValue: string = '';
  private bottomValue: string = '';
  public topKeyName = 'month';
  public bottomKeyName = 'day';
  public isHideCalendar:boolean = true;

  constructor(@Inject('type.service') public typeService: any,
              @Inject('date.service') public dateService: any,
              @Inject('dialog.service') public dialogService: any,
  ) {

  }

  /**
   * 监听空白处的点击事件
   * @param event
   */
  @HostListener('document:click', ['$event']) click(event: any) {
    this.isHideCalendar = true;
  }




  @Output() public outSelectInfo = new EventEmitter();
  /**
   * {
   *    titleTop:'Month'   //title 1
   *    titleBottom:'Day'   //title 2
   *    isHourMinute:true,  //选择的是小时和分钟  （默认是月和天）
   *    topValue：'',       //第一个默认选中值
   *    bottomValue:'',    //第二个默认选中值
   *    topKeyName:'hour',      //outputData key名
   *    bottomKeyName:'minute'  //outputData key名
   *    isShow:true , //显示日历
   *
   *
   * }
   * @param data
   */
  @Input() set setOption(data: any) {
    if (data) {
      if(data.isShow && this.isHideCalendar){
        this.isHideCalendar = false;
      }else{
        this.isHideCalendar = true;
      }
      // this.isShowCalendar = true;
      if(data.titleTop){
        this.titleTop = data.titleTop;
        this.titleBottom = data.titleBottom;
      }
      //传出outputData 的key名
      if(data.topKeyName){
        this.topKeyName = data.topKeyName;
      }
      if(data.bottomKeyName){
        this.bottomKeyName = data.bottomKeyName;
      }

      //传入默认选中值
      if(data.topValue){
        this.topValue = data.topValue;
      }
      if(data.bottomValue){
        this.bottomValue = data.bottomValue;
      }

      //初始化值
      if(data.isHourMinute){
        this.isHourMinute = true;
        //小时
        this.monthList = this.initValue(23,0,1,1);
        //分钟
        this.dayList = this.initValue(55,0,5,0);
      }else{
        //月 1-12
        this.monthList = this.initValue(12,1,1,1);
        //天 1- 31
        this.dayList = this.initValue(31,1,1,0);
      }
    }
  }

  ngOnInit() {
  }

  /**
   * 初始化显示
   * @param max 最大值
   * @param min 最小值
   * @param step 每个相差的值
   * @param type 1是第一个值列表  第二个值列表
   * @returns {Array}  返回要循环显示的数组{selected：true | false, number:'01'}
   */
  initValue(max: number,min: number,step:number,type:number):Array<any> {
    let array = [];
    for (let i = min; i <= max; i=i+step) {
      let item = this.typeService.clone(this.settings);
      item.number = i<10 ?`0${i}`:i.toString();
      if(type){
        if(parseInt(this.topValue) == i){
          item.selected = true;
        }else{
          item.selected = false;
        }
      }else{
        if(parseInt(this.bottomValue) == i){
          item.selected = true;
        }else{
          item.selected = false;
        }
      }
      array.push(item);
    }
    return array;
  }

  /**
   * 点击天，月
   * @param event
   * @param index 当前 天/月
   * @param array 操作 天 | 月 数组
   * @param key   属性名
   */
  onClickEvent(event: any,index: number,array:Array<any>,key){

    event.stopPropagation();
    for (let i = 0; i < array.length; i++) {
      array[i].current = false;
      if (index == i) {
        array[i].selected = true;
         this.outputData[key] = parseInt(array[i].number);
      } else {
        array[i].selected = false;
      }
    }
  }

  /**
   * 点击done按钮
   * @param event
   */
  onClickDone(event: any){
    event.stopPropagation();
    if(typeof this.outputData[this.topKeyName] !=='undefined' && typeof this.outputData[this.bottomKeyName] !=='undefined'){
      this.outSelectInfo.emit(this.outputData);
      this.isHideCalendar = true;
      // this.isShowCalendar = false;
    }

  }
}