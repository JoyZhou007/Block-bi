import {Component, OnInit, Inject, Input, HostListener} from '@angular/core';
import * as MissionConstant from '../../../../shared/config/mission.config';
import {MissionModelService} from "../../../../shared/services/model/mission-model.service";
import {MissionDetailAPIModel} from "../../../../shared/services/model/entity/mission-entity";
import {PersonalModelService} from '../../../../shared/services/index.service';
import {DateService} from "../../../../shared/services/common/data/date.service";


@Component({
  selector: 'read-expense',
  templateUrl: '../../../template/detail/function/mission-detail-expense.component.html',
  providers: [PersonalModelService]
})

export class MissionDetailExpenseComponent {
  public isPayment: boolean = false;
  public isCollection: boolean = true;
  public contactsList: any;
  public internalList: Array<any>;
  public bankList: any;
  public isShowPayeeList: boolean = false;
  public expenseData: any = {};
  public currencyArray: Array<any>;
  public expenseArr: Array<any> = [];
  public expenseInfo: any = {};
  public missionList: any;

  // 下拉菜单选项
  public dropdownSettings: any;
  public dropdownOptions: Array<any> = [];
  public missionCommonList: any;
  public payeeArr: Array<any> = [];
  public missionDetailData: any;
  public isEditModel: boolean = false;
  public currentBank: any;
  public paidCount: number = 0;
  public paidMoneyCount: number = 0;
  public originalCondition: string;
  public originalAmount: string;
  public variationOffer: Array<any> = [];

  constructor(@Inject('app.config') public config: any,
              @Inject('user-data.service') public userDataService: any,
              @Inject('type.service') public typeService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('date.service') public dateService: DateService,
              @Inject('page.element') public element: any,
              @Inject('dialog.service') public dialogService: any,
              public missionModelService: MissionModelService,
              public personalService: PersonalModelService) {
  }


  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
    if (this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_EXPENSE]) {
      this.expenseData = this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_EXPENSE];
      this.getContactList();
      this.getBankList();
      this.setCurrencyList();
      this.getMissionList();
      this.getMissionCommonList();
      this.getExpenseDate(this.expenseData.payment_details);
      this.getExpenseDate(this.expenseData.variation_offer);
    } else {
      this.expenseData = {
        form: '1',
        payee: '',
        payee_account: '',
        account_type: '1',
        bank_name: 'ICBC',
        contract_unit: '￥',
        contract_amount: '',
        contract_times: '0',
        payment_details: this.expenseArr,
        calendarOption: {},
        found_date: '',
        isShowCalendar: false
      };
    }
  }

  @Input() set setReadType(type: any) {
    this.isEditModel = type;
  }


  //页面初始化
  ngOnInit() {
    this.expenseInfo = {
      payment_condition: "0",
      payment_percentage: "0",
      payment_to_type: "1",
      expense_claim_type:  this.translate.manualTranslate('Mission Claim'),
      payment_to_value: "",
      payment_to_type_direction: "2",
      payment_status: 'After',
      payment_mission_name: '',
      isShowStatus: false,
      isEdit: true,
      expense_status: 1,
      found_date: '',
      calendarOption: {}
    };
  }


  @HostListener('document:click', ['$event'])
  click(event: any) {
    event.stopPropagation();
    this.isShowPayeeList = false;
  }

  /**
   * 选择当前的支付类型 collection/payment
   */
  chooseExpenseType(data: any) {
    if (data === 'Collection') {
      this.isCollection = true;
      this.isPayment = false;
      this.expenseData.form = 1;
    } else if (data === 'Payment') {
      this.isCollection = false;
      this.isPayment = true;
      this.expenseData.form = 2;
    }
  }


  /**
   * 获取支付对象联系人列表
   */
  getContactList() {
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
          this.getCurrentBank(this.expenseData);
        }
      })
  }

  /**
   * 获取支付时间
   */
  getExpenseDate(data: any) {
    if (data) {
      for (let i in data) {
        if (data[i].payment_to_type === '2') {
          let dayTime = this.dateService.formatWithTimezone(data[i].payment_to_value, 'dd');
          let months = this.dateService.formatWithTimezone(data[i].payment_to_value, 'mmmm');
          let monthTime = this.dateService.formatWithTimezone(data[i].payment_to_value, 'mmm');
          let month = this.dateService.formatWithTimezone(data[i].payment_to_value, 'mm');
          let yearTime = this.dateService.formatWithTimezone(data[i].payment_to_value, 'yyyy');
          let weekTime = this.dateService.formatWithTimezone(data[i].payment_to_value, 'dddd');
          let daysTime = this.dateService.formatWithTimezone(data[i].payment_to_value, 'ddS');
          data[i].formateDate = {
            monthDay: dayTime,
            week: weekTime,
            stringMonth: monthTime,
            year: yearTime
          };
          data[i].found_date = daysTime + ' ' + months + ' ' + yearTime;
          data[i].calendarOption = {
            selected: yearTime + ' ' + month + ' ' + dayTime
          };
        }
      }
    }
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
    data.calendarOption.dayString = this.dateService.formatWithTimezone(data.calendarOption.formatDateString, 'ddS');
    data.found_date = data.calendarOption.dayString + ' ' + data.calendarOption.monthName + ' ' + data.calendarOption.year;
    data.payment_to_value = data.calendarOption.formatUtcString;
  }


  /**
   * 选择所需要的银行
   */
  selectTheBank(data: any) {
    this.expenseData.account_type = data.short_name;
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
  selectCurrency(data: any) {
    this.expenseData.contract_unit = data;
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
   * 点击更换付款次数
   */
  changeContractTimes(param: string) {
    if (parseInt(this.expenseData.contract_amount) > 0) {
      if (param === 'reduce') {
        if (this.expenseData.contract_times > this.paidCount) {
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
      this.calculateLastMoney();
    }
  }


  /**
   * 点击切换付款方式
   */
  switchPayWay(data: any, event: any) {
    if (data.expense_status === 1) {
      if (data.payment_to_type === '2') {
        data.expense_claim_type = this.translate.manualTranslate('Mission Claim');
        data.payment_to_type = '1';
        data.payment_status = 'After';
        data.payment_to_type_direction = '2';
        data.isShowStatus = false;
      } else {
        data.expense_claim_type =  this.translate.manualTranslate('Date Claim');
        data.payment_to_type = '2';
        data.isShowStatus = true;
      }
    }
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
    data.payment_status = param;
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
   * 光标进去之后获取变化之前的值
   */
  getOriginalData(data: any, param: string) {
    if (param === 'condition') {
      this.originalCondition = data.payment_condition;
    } else if (param === 'percentage') {
      this.originalCondition = data.payment_percentage;
    }
  }

  /**
   * 总钱数变化
   */
  changeContractAmount(event: any, data: any) {
    if (data) {
      if (event.target.value === '') {
        data.isShowAmountError = true;
      } else {
        data.isShowAmountError = false;
        if (this.expenseData.contract_times === '0') {
          this.expenseData.contract_times = '1';
          let a: any;
          a = this.typeService.clone(this.expenseInfo);
          this.expenseArr.push(a);
        }
      }

      if (parseInt(data) < this.paidMoneyCount) {
        this.expenseData.contract_amount = this.originalAmount;
      } else {
        this.calculateLastMoney();
        this.calculateEachPercent();
      }
    }
  }

  /**
   * 光标进入总钱数的时候获取钱数总数
   */
  getOriginal(data: any) {
    this.originalAmount = data;
  }


  /**
   * 输入金额计算百分比/或者输入百分比计算金额
   */
  calculateMoney(event: any, data: any, param?: string) {
    if (event.target.value === '' || !(parseInt(event.target.value) > 0)) {
      data.isShowPayCountError = true;
    } else {
      data.isShowPayCountError = false;
      if (param === 'condition') {
        this.calculateAllMoney();
      } else if (param === 'percentage') {
        if (parseInt(data.payment_percentage) > 100) {
          data.payment_percentage = '100';
        }
        data.payment_condition = (parseInt(this.expenseData.contract_amount) * data.payment_percentage / 100).toFixed(0) ?
          (parseInt(this.expenseData.contract_amount) * data.payment_percentage / 100).toFixed(0).toString() : 0
        ;
        this.calculateLastMoney();
      }
    }


  }


  /**
   * 计算最后一个框的值
   */
  calculateLastMoney() {
    let amountCount: number = 0;
    let percentCount: number = 0;
    if (this.expenseArr.length > 0) {
      for (let i = 0; i < this.expenseArr.length - 1; i++) {
        amountCount = amountCount + parseInt(this.expenseArr[i].payment_condition);
        percentCount = percentCount + parseInt(this.expenseArr[i].payment_percentage);
      }
      this.expenseArr[this.expenseArr.length - 1].payment_condition =
        (parseInt(this.expenseData.contract_amount) - amountCount) ? (parseInt(this.expenseData.contract_amount) - amountCount).toString() : 0;
      this.expenseArr[this.expenseArr.length - 1].payment_percentage = (100 - percentCount).toString() ? (100 - percentCount).toString() : 0;
    }
  }

  /**
   * 计算总钱数
   */
  calculateAllMoney() {
    let allCount: number = 0;
    for (let i in this.expenseArr) {
      allCount += parseInt(this.expenseArr[i].payment_condition);
    }
    if (allCount < this.paidMoneyCount) {
      this.expenseData.contract_amount = this.paidMoneyCount.toString();
      this.calculateLastMoney();
    } else {
      this.expenseData.contract_amount = allCount.toString();
    }
    this.calculateEachPercent();
  }

  /**
   * 计算每笔支付对应的百分比
   */
  calculateEachPercent() {
    for (let i in this.expenseArr) {
      this.expenseArr[i].payment_percentage = Math.round((parseInt(this.expenseArr[i].payment_condition) / parseInt(this.expenseData.contract_amount)) * 100).toString();
    }
  }

  /**
   *获取missionList
   */
  getMissionList() {
    this.missionModelService.missionExpenseList({}, (data: any) => {
      if (data.status === 1) {
        this.missionList = this.typeService.getObjLength(data.data) > 0 ? data.data : [];
      }
    })
  }

  /**
   * 点击跳转到相关联的mission详情页(新窗口打开)
   */
  hrefToTheMission(data: any) {
    window.open('mission/detail/' + data.payment_to_value);
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
        this.getExpenseData();
      }
    })
  }

  /**
   * 设置收款人下拉列表
   * @param param
   */
  setPayeeList(param: any) {
    this.initSettings();
    for (let key in param) {
      if (param.hasOwnProperty(key)) {
        this.dropdownSettings.group.push({key: key, title: key.toUpperCase()});
        let optionDataArr = param[key];
        for (let i in optionDataArr) {
          let optionData = optionDataArr[i];
          let tmpModel = {
            id: optionData.uid,
            isCurrent: false,
            label: optionData.work_name,
            key: optionData.work_name,
            imageLabel: optionData.user_profile_path ? this.config.resourceDomain + optionData.user_profile_path : '',
            group: key
          };
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
      this.dropdownSettings = {
        enableSearch: true,
        enableTab: false,
        isMultiple: false,
        group: [],
        delBtnClass: 'font-remove'
      };
    }
  }


  /**
   * 加载已有数据
   * @param event
   */
  getExpenseData() {
    this.payeeArr = [];
    for (let i in this.dropdownOptions) {
      if (this.dropdownOptions[i].id === this.expenseData.payee) {
        this.payeeArr.push(this.dropdownOptions[i]);
      }
    }
    if (this.expenseData.form === '1') {
      this.isCollection = true;
      this.isPayment = false;
    } else if (this.expenseData.form === '2') {
      this.isCollection = false;
      this.isPayment = true;
    }
    this.expenseArr = this.expenseData.payment_details;
    this.variationOffer = this.expenseData.variation_offer;
    this.getPayDetailInfo(this.expenseArr);
    this.getPayDetailInfo(this.variationOffer);
    this.calculatePaidCount();
  }

  /**
   * 获取支付的具体信息
   * @param data
   */
  getPayDetailInfo(data: any) {
    for (let i in data) {
      if (data[i].payment_to_type === '1') {
        data[i].payment_status = 'After';
        data[i].expense_claim_type = this.translate.manualTranslate('Mission Claim');
        data[i].calendarOption = {}
      } else if (data[i].payment_to_type === '2') {
        data[i].expense_claim_type = this.translate.manualTranslate('Date Claim');
        if (data[i].payment_to_type_direction === '1') {
          data[i].payment_status = 'Before';
        } else {
          data[i].payment_status = 'After';
        }
      }
      if (data[i].payment_to_type === '1') {
        for (let k in this.missionList) {
          if (data[i].payment_to_value === this.missionList[k].mid) {
            data[i].payment_mission_name = this.missionList[k].name
          }
        }
      }
      data[i].payment_percentage = ((parseInt(data[i].payment_condition) / parseInt(this.expenseData.contract_amount)) * 100).toFixed(2);
    }
  }


  /**
   *计算已经付款的次数
   */
  calculatePaidCount() {
    this.paidCount = 0;
    for (let i in this.expenseArr) {
      if (this.expenseArr[i].expense_status !== 1) {
        this.paidCount++;
        this.paidMoneyCount += parseInt(this.expenseArr[i].payment_condition);
      }
    }
  }


  /**
   * 整理金钱显示的格式
   */
  formatMoney(money: any) {
    if (/[^0-9\.]/.test(money)) return '0.00';
    money = money.replace(/^(\d*)$/, "$1.");
    money = (money + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    money = money.replace(".", ",");
    var re = /(\d)(\d{3},)/;
    while (re.test(money)) {
      money = money.replace(re, "$1,$2");
    }
    money = money.replace(/,(\d\d)$/, ".$1");
    return '' + money.replace(/^\./, "0.");
  }

  /**
   * 整理银行卡号
   */
  formatBankNum(data: any) {
    let value = data.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
    return value;
  }


  /**
   * 匹配当前银行对应的id
   */
  getCurrentBank(data: any) {
    for (let i in this.bankList) {
      if (parseInt(data.account_type) === this.bankList[i].id) {
        this.currentBank = this.bankList[i].short_name;
      }
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
  }

  /**
   * 验证金钱格式是否正确
   * @returns {boolean}
   * @constructor
   */
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
    //验证支付账户
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
    //验证支付总金额
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
    if (this.expenseData.isShowAccountError) return false;
    //验证 pay way
    for (let i in this.expenseArr) {
      if (this.expenseArr[i].payment_to_type === '1' && (this.expenseArr[i].payment_mission_name === '' || !this.expenseArr[i].payment_mission_name)) {
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
    for (let i in this.variationOffer) {
      if (this.variationOffer[i].payment_to_type === '1' && (this.variationOffer[i].payment_mission_name === '' || !this.variationOffer[i].payment_mission_name)) {
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
    //验证具体每一笔支付
    let count1: number = 0;
    for (let i in this.variationOffer) {
      if ((parseInt(this.variationOffer[i].payment_condition)) > 0) {
        count1++;
      }
    }
    let count: number = 0;
    for (let i  in this.expenseArr) {
      if ((parseInt(this.expenseArr[i].payment_condition)) > 0 && (parseInt(this.expenseArr[i].payment_percentage)) >= 0
        && (parseInt(this.expenseArr[i].payment_percentage)) <= 100) {
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


}
