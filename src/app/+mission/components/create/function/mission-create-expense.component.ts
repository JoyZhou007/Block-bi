import {Component, OnInit, Inject, HostListener, ViewEncapsulation, ElementRef} from '@angular/core';
import {PersonalModelService} from '../../../../shared/services/index.service';
import {MissionDetailAPIModel} from "../../../../shared/services/model/entity/mission-entity";
import {MissionModelService} from "../../../../shared/services/index.service";
import {DropdownSettings} from "../../../../dropdown/dropdown-setting";
import {DropdownOptionModel} from "../../../../dropdown/dropdown-element";
import {DateService} from "../../../../shared/services/common/data/date.service";

@Component({
  selector: 'create-expense',
  templateUrl: '../../../template/create/function/mission-create-expense.component.html',
  providers: [PersonalModelService],
  encapsulation: ViewEncapsulation.None,
})

export class MissionCreateExpenseComponent {

  public isPayment: boolean = false;
  public isCollection: boolean = true;

  public contactsList: any;
  public internalList: Array<any>;
  public cooperatorList: Array<any>;
  public bankList: any;

  public payeeInfo: any;
  public isShowPayeeList: boolean = false;
  public expenseData: any;

  public currencyArray: Array<any>;

  public expenseArr: Array<any> = [];

  public expenseInfo: any;

  public missionList: any;

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any>;
  public missionCommonList: any;
  public payeeArr: Array<any> = [];

  public originalAmount: string;

  //添加新的合同
  public variationOffer: Array<any> = [];

  // public calendarOption: any = {};

  //选中日期
  // public found_date: string;

  constructor(@Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('page.element') public element: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('date.service') public dateService: DateService,
              public missionModelService: MissionModelService,
              public personalService: PersonalModelService) {
  }

  //页面初始化
  ngOnInit() {
    this.getContactList();
    this.getBankList();
    this.setCurrencyList();
    this.getMissionList();
    this.getMissionCommonList();
    this.payeeInfo = {};
    this.expenseData = {
      form: '1',
      payee: '',
      payee_account: '',
      account_type: '1',
      bank_name: 'ICBC',
      contract_unit: '￥',
      contract_amount: '',
      contract_times: '1',
      payment_details: this.expenseArr
    };
    this.expenseInfo = {
      payment_condition: "0",
      payment_percentage: "0",
      payment_to_type: "1",
      expense_claim_type: this.translate.manualTranslate('Mission Claim'),
      payment_to_value: "",
      payment_to_type_direction: "2",
      contract_unit: '￥',
      expense_status: 'After',
      payment_mission_name: '',
      isShowStatus: false,
      isEdit: true,
      calendarOption: {},
      found_date: '',
      isShowCalendar: false,
    };
    this.expenseArr.push(this.typeService.clone(this.expenseInfo));
  }


  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowPayeeList = false;
    for(let i=0;i<this.expenseArr.length;i++){
      this.expenseArr[i].isShowCalendar = false;
    }
    for(let i=0;i<this.variationOffer.length;i++){
      this.variationOffer[i].isShowCalendar = false;
    }
  }

  /**
   * 选择当前的支付类型 collection/payment
   */
  chooseExpenseType(data: any) {
    if (data === 'Collection') {
      this.isCollection = true;
      this.isPayment = false;
      this.expenseData.form = '1';
    } else if (data === 'Payment') {
      this.isCollection = false;
      this.isPayment = true;
      this.expenseData.form = '2';
    }
  }


  /**
   * 获取支付对象联系人列表
   */
  getContactList() {
    //获取好友列表
    this.contactsList = this.userDataService.getContactList();
    this.internalList = this.contactsList.internal;
  }


  /**
   * 获取银行列表
   */
  getBankList() {
    this.personalService.banksList(
      (data: any) => {
        if (data.status === 1) {
          this.bankList = data.data;
        }
      })
  }


  /**
   * 选择所需要的银行
   */
  selectTheBank(data: any) {
    this.expenseData.bank_name = data.short_name;
    this.expenseData.account_type = data.id;
  }

  /**
   * 获取货比单位
   */
  setCurrencyList(): void {
    this.currencyArray = MissionDetailAPIModel.getCurrencyList();
  }


  /**
   * 选择货币类型
   */
  selectCurrency(currency: any) {
    this.expenseData.contract_unit = currency;
  }


  /**
   * 控制键盘只能输入数字
   */
  onKeyDown(event: any) {
    let code = event.keyCode;
    if (!this.keyCode(code) || event.ctrlKey || event.shiftKey || event.altKey) {
      event.preventDefault();
      event.target.blur();
      setTimeout(function () {
        event.target.focus();
      })
    }
  }

  keyCode(code) {
    return (code >= 48 && code <= 57) || (code >= 96 && code <= 105) || code === 8 || code === 13;
  }

  /**
   * 总钱数变化
   */
  changeContractAmount(event: any, data: any) {
    if (event.target.value === '') {
      data.isShowAmountError = true;
    } else {
      data.isShowAmountError = false;
      if (event.target.value != '0' && this.expenseData.contract_times === '0') {
        this.expenseData.contract_times = '1';
        let a: any;
        a = this.typeService.clone(this.expenseInfo);
        this.expenseArr.push(a);
      }
    }
    this.calculateLastMoney();
    this.calculateEachPercent();
  }

  /**
   * 光标进入总钱数的时候获取钱数总数
   */
  getOriginal(data: any) {
    this.originalAmount = data;
  }


  /**
   * 计算每笔支付对应的百分比
   */
  calculateEachPercent() {
    for (let i in this.expenseArr) {
      this.expenseArr[i].payment_percentage =
        Math.round((parseInt(this.expenseArr[i].payment_condition) / parseInt(this.expenseData.contract_amount)) * 100) ?
          Math.round((parseInt(this.expenseArr[i].payment_condition) / parseInt(this.expenseData.contract_amount)) * 100).toString() : 0;
    }
  }


  /**
   * 点击更换付款次数
   */
  changeContractTimes(param: string) {
    if (parseInt(this.expenseData.contract_amount) > 0) {
      if (param === 'reduce') {
        if (this.expenseData.contract_times > 1) {
          this.expenseData.contract_times--;
          this.expenseData.contract_times = this.expenseData.contract_times.toString();
          this.expenseArr.pop();
        }
      } else if (param === 'add') {
        if (this.expenseData.contract_times < 10) {
          this.expenseData.contract_times++;
          this.expenseData.contract_times = this.expenseData.contract_times.toString();
          let a: any;
          a = this.typeService.clone(this.expenseInfo);
          this.expenseArr.push(a);
        }
      }
      this.judgeCanEdit();
      this.calculateLastMoney();
    }
  }


  /**
   * 输入付款次数
   */
  keyExpenseTime(event: any, el: any) {
    if (parseInt(this.expenseData.contract_amount) > 0) {
      if ((event.keyCode > 47 && event.keyCode < 58) || (event.keyCode > 95 && event.keyCode < 106) || event.keyCode === 8) {
        event.returnValue = true;
        if (el.value !== '') {
          this.expenseData.contract_times = parseInt(el.value);
          if (this.expenseData.contract_times > 10) {
            this.expenseData.contract_times = 10;
            el.value = '10';
          }
          if (this.expenseData.contract_times > this.expenseArr.length) {
            let k = this.expenseData.contract_times - this.expenseArr.length;
            for (let i = 0; i < k; i++) {
              let a: any;
              a = this.typeService.clone(this.expenseInfo);
              this.expenseArr.push(a);
            }
          } else {
            let j = this.expenseArr.length - this.expenseData.contract_times;
            for (let i = 0; i < j; i++) {
              let a: any;
              a = this.typeService.clone(this.expenseInfo);
              this.expenseArr.pop();
            }
          }
        } else {
          this.expenseData.contract_times = 0;
          this.expenseArr = [];
        }
      } else {
        event.returnValue = false;
      }
      this.judgeCanEdit();
    }
    this.calculateLastMoney();
  }


  /**
   * 点击切换付款方式
   */
  switchPayWay(data: any, event: any) {
    if (this.element.hasClass(event.target.parentElement, 'm-r-c-claim-select')) {
      event.target.parentElement.setAttribute('class', 'pull-left m-claim m-r-c-claim-left');
      data.expense_claim_type =  this.translate.manualTranslate('Mission Claim');
      data.payment_to_type = '1';
      data.expense_status = 'After';
      data.payment_to_type_direction = '2';
      data.isShowStatus = false;
      data.isShowCalendar = false;
    } else {
      event.target.parentElement.setAttribute('class', 'pull-left m-claim m-r-c-claim-left m-r-c-claim-select');
      data.expense_claim_type =  this.translate.manualTranslate('Date Claim');
      data.payment_to_type = '2';
      data.isShowStatus = true;
    }


  }


  /**
   * 点击显示日历框
   */
  showDateControl(data: any, event: any) {
    event.stopPropagation();
    data.isShowCalendar = !data.isShowCalendar;
  }


  /**
   * 选择时间
   */
  selectDate(data: any, dateObj: any) {
    data.isShowCalendar = false;
    let formatDateForm: string = 'yyyy-mm-dd HH:MM:ss';
    data.calendarOption = dateObj;
    data.calendarOption.selected = data.calendarOption.year + '-' + (data.calendarOption.month + 1) + '-' + data.calendarOption.monthDay;
    data.calendarOption.formatDateString = data.calendarOption.year + '-' + (data.calendarOption.month + 1) + '-' + data.calendarOption.monthDay + ' '
      + data.calendarOption.hour + ':' + data.calendarOption.minute + ':' + data.calendarOption.minute;
    data.calendarOption.formatUtcString = this.dateService.utcDateFormat(data.calendarOption.formatDateString, formatDateForm);
    data.calendarOption.dayString = this.dateService.format(data.calendarOption.formatDateString, 'ddS');
    data.found_date = data.calendarOption.dayString + ' ' + data.calendarOption.monthName + ' ' + data.calendarOption.year;
    data.payment_to_value = data.calendarOption.formatUtcString;
  }


  /**
   * Date Claim 状态下
   * 点击选择付款状态
   */
  selectStatus(data: any, param: string) {
    if (param === 'Before') {
      data.payment_to_type_direction = '1';
    } else if (param === 'After') {
      data.payment_to_type_direction = '2';
    }
    data.expense_status = param;
  }


  /**
   * 选择需要参考的mission 节点
   */
  selectTheMission(data: any, mission: any) {
    data.payment_mission_name = mission.name;
    data.payment_to_value = mission.mid;
  }

  /**
   * 删除支付参考的mission 时间节点
   */

  deleteTheMission(data: any, event: any) {
    event.stopPropagation();
    data.payment_to_value = '';
  }


  /**
   * 阻止事件冒泡专用
   */
  doSelectBox(event: any) {
    event.stopPropagation();
  }


  /**
   * 设定最后一个的input框不可以输入
   */
  judgeCanEdit() {
    if (this.expenseArr.length > 1) {
      this.expenseArr[this.expenseArr.length - 1].isEdit = false;
      for (let i = 0; i < this.expenseArr.length - 1; i++) {
        this.expenseArr[i].isEdit = true;
      }
    }
  }


  /**
   * 输入金额计算百分比
   */
  calculateMoney(event: any, data: any, param?: string) {
    if (event.target.value === '' || !(parseInt(event.target.value) > 0)) {
      data.isShowPayCountError = true;
    } else {
      data.isShowPayCountError = false;
      if (param === 'condition') {
        if (parseInt(data.payment_condition) > parseInt(this.expenseData.contract_amount)) {
          data.payment_condition = this.expenseData.contract_amount;
        }
        if (this.expenseData.contract_amount !== '') {
          data.payment_percentage =
            Math.round((parseInt(data.payment_condition) / parseInt(this.expenseData.contract_amount)) * 100)?
              Math.round((parseInt(data.payment_condition) / parseInt(this.expenseData.contract_amount)) * 100).toString():0;
        }
      } else if (param === 'percentage') {
        if (parseInt(data.payment_percentage) > 100) {
          data.payment_percentage = '100';
        }
        data.payment_condition = (parseInt(this.expenseData.contract_amount) * data.payment_percentage / 100).toFixed(0) ?
          (parseInt(this.expenseData.contract_amount) * data.payment_percentage / 100).toFixed(0).toString() : 0;
      }
      if (param) {
        this.calculateLastMoney();
      }
    }
  }


  /**
   * 计算最后一个框的值
   */
  calculateLastMoney() {
    if (this.expenseArr.length > 0) {
      let amountCount: number = 0;
      let percentCount: number = 0;
      for (let i = 0; i < this.expenseArr.length - 1; i++) {
        amountCount = amountCount + parseInt(this.expenseArr[i].payment_condition);
        percentCount = percentCount + parseInt(this.expenseArr[i].payment_percentage);
      }
      this.expenseArr[this.expenseArr.length - 1].payment_condition =
        (parseInt(this.expenseData.contract_amount) - amountCount) ? (parseInt(this.expenseData.contract_amount) - amountCount).toString() : 0;
      this.expenseArr[this.expenseArr.length - 1].payment_percentage = (100 - percentCount) ? (100 - percentCount).toString() : 0;
      if (parseInt(this.expenseArr[this.expenseArr.length - 1].payment_condition) <= 0) {
        this.expenseArr[this.expenseArr.length - 1].isShowPayCountError = true;
      } else {
        this.expenseArr[this.expenseArr.length - 1].isShowPayCountError = false;
      }
    }
  }


  /**
   *获取missionList
   */

  getMissionList() {
    this.missionModelService.missionExpenseList({}, (data: any) => {
      if (data.status === 1) {
        this.missionList = this.typeService.getObjLength(data.data)  > 0 ? data.data : [];
      }
    })
  }

  /**
   * 获取payee信息
   */
  /**
   * 获取下拉框选项人员的List
   */
  getMissionCommonList() {
    this.missionModelService.missionUserInfoList({}, (data: any) => {
      if (data.status === 1) {
        this.missionCommonList = data.data;
        this.setPayeeList(this.missionCommonList);
      }
    })
  }

  setPayeeList(param: any) {
    this.initSettings();
    this.dropdownOptions = [];
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = new DropdownOptionModel();
          tmpModel.initData({
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          });
          this.dropdownOptions.push(tmpModel);
        }
      }
    }
  }


  modelChange(data: any) {
    this.payeeArr = data[0];
    if (this.payeeArr[0]) {
      this.expenseData.payee = this.payeeArr[0].id;
    } else {
      this.expenseData.payee = '';
    }
  }

  initSettings() {
    if (typeof this.dropdownSettings === 'undefined') {
      this.dropdownSettings = new DropdownSettings();
    }
  }

  /**
   * 获取付款步骤的后缀
   * @param step
   * @returns {string}
   */
  getStepTitle(step: number): String {
    if (step < 0) {
      return '';
    }
    if (step === 0) {
      return 'start';
    }
    if (step % 10 === 1) {
      return 'DOWN';
    }
    if (step % 10 === 2) {
      return step + 'ND';
    }
    if (step % 10 === 3) {
      return step + 'RD';
    }
    return step + 'TH';
  }

  /**
   * 添加一个新的vo合同
   */
  addOtherContract() {
    let a: any = this.typeService.clone(this.expenseInfo);
    this.variationOffer.push(a);
    // this.setCalendarData(a);
  }

  VerificationExpenseData() {
    //验证payee人
    if (this.expenseData.form == '2' && this.expenseData.payee === '') {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The payee is not correct'
      };
      this.dialogService.openWarning(settings);
      return false;
    }
    //银行账户验证
    if (this.expenseData.payee_account === '') {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The pay account is not correct'
      };
      this.dialogService.openWarning(settings);
      return false;
    }
    //支付总金额验证
    if (this.expenseData.contract_amount === '') {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The pay amount is not correct'
      };
      this.dialogService.openWarning(settings);
      return false;
    }
    //pay way 验证
    for (let i in this.variationOffer) {
      if (this.variationOffer[i].payment_to_type === '1' && this.variationOffer[i].payment_mission_name === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The pay way is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (this.variationOffer[i].payment_to_type === '2' && this.variationOffer[i].found_date === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The pay way is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    for (let i in this.expenseArr) {
      if (this.expenseArr[i].payment_to_type === '1' && this.expenseArr[i].payment_mission_name === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The pay way is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      } else if (this.expenseArr[i].payment_to_type === '2' && this.expenseArr[i].found_date === '') {
        let settings = {
          mode: '3',
          title: 'Notice!',
          isSimpleContent: true,
          simpleContent: 'The pay way is not correct'
        };
        this.dialogService.openWarning(settings);
        return false;
      }
    }
    //具体每一笔支付验证
    let count1: number = 0;
    for (let i in this.variationOffer) {
      if ((parseInt(this.variationOffer[i].payment_condition)) > 0) {
        count1++;
      }
    }
    let count: number = 0;
    for (let i  in this.expenseArr) {
      if ((parseInt(this.expenseArr[i].payment_condition)) > 0 && (parseInt(this.expenseArr[i].payment_percentage)) >= 0) {
        count++;
      }
    }
    if (count === this.expenseArr.length && count1 === this.variationOffer.length) {
      return true;
    } else {
      let settings = {
        mode: '3',
        title: 'Notice!',
        isSimpleContent: true,
        simpleContent: 'The paymentInfo is not correct'
      };
      this.dialogService.openWarning(settings);
      return false;
    }
  }


  /**
   * 表单验证
   */
  validateFormData(event: any, data: any) {
    let targetEle: any = event.target;
    if (targetEle.value === '') {
      data.isShowAccountError = true;
    } else {
      data.isShowAccountError = false;
    }
  }

  /**
   * 删除经验
   */
  onDelete(index: number){
    this.variationOffer.splice(index,1);
  }

}
