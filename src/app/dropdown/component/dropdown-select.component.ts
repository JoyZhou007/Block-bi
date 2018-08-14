/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/2/7.
 */
import {
  Component, OnInit, Input, ViewChild, AfterViewInit, AfterViewChecked, Output, EventEmitter, OnChanges, SimpleChanges,
  Inject
} from '@angular/core';
import {DropdownSettings} from '../dropdown-setting';
import {DropdownOptionModel} from "../dropdown-element";

@Component({
  selector: 'dropdown-select',
  templateUrl: './../template/dropdown-select.component.html'
})
export class DropdownSelectComponent implements OnInit,AfterViewChecked,OnChanges {

  constructor(@Inject('file.service') public fileService: any,
              @Inject('user-data.service') public userDataService: any,) {
  }


  public currentGroup: any = {key: '', title: ''};
  public autoHeight: string = '0px';
  public elementHeight: string;
  public win: any = <any>window;


  private _openStatus: boolean = false;
  @Input('openStatus') set openStatus(data: boolean) {
    if (this._openStatus === true && data === false) {
      this.resetFilterDropdown();
    }
    this._openStatus = data;
  };

  @ViewChild('dSelectPeople') private dSelectPeople: any;

  get openStatus() {
    return this._openStatus;
  }

  private _settings: DropdownSettings;
  //被选中值
  private _selectedOptions: Array<any> = [];
  //下拉选项
  private _dropdownOptions: Array<any> = [];
  public filterFlags;

  @Output('outDropdownElementClickEvent') outDropdownElementClickEvent = new EventEmitter<any>();

  @Input('settings') set settings(data: DropdownSettings) {
    //TODO
    if (data.group.length > 0) {
      this.currentGroup = data.group[0];
    }
    this._settings = data;
  };

  get settings() {
    return this._settings;
  }

  @Input('selectedOptions') set selectedOptions(data: Array<any>) {

    this._selectedOptions = data;
  };

  get selectedOptions() {
    return this._selectedOptions;
  }

  @Output('selectedOptionsChange') selectedOptionsChange = new EventEmitter<any>();

  @Input('dropdownOptions') set dropdownOptions(data: Array<any>) {
    this._dropdownOptions = data;
    for (let i in this._dropdownOptions) {
      this._dropdownOptions[i].imageLabel = this.fileService.getImagePath(36, this._dropdownOptions[i].imageLabel);

    }
    for (let k in  this.settings.group) {
      let count: number = 0
      for (let i in this._dropdownOptions) {
        if (this._dropdownOptions[i].group == this.settings.group[k].key) {
          count++;
        }
      }
      this.settings.group[k]['count'] = count;
    }
  };

  get dropdownOptions() {
    return this._dropdownOptions;
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if (!this.elementHeight) {
      this.elementHeight = this.dSelectPeople.nativeElement.offsetHeight;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // let log: string[] = [];
    // for (let propName in changes) {
    //   let changedProp = changes[propName];
    //   let to = JSON.stringify(changedProp.currentValue);
    //   if (to === '[]'){
    //   }
    //   if (changedProp.isFirstChange()) {
    //     log.push(`Initial value of ${propName} set to ${to}`);
    //   } else {
    //     let from = JSON.stringify(changedProp.previousValue);
    //     log.push(`${propName} changed from ${from} to ${to}`);
    //   }
    // }
    ////this.changeLog.push(log.join(', '));
  }

  resetFilterDropdown() {
    this.dropdownOptions.forEach((ele: any) => {
      ele.hasFiltered = false;
    });
    let filterFlags = {};
    if (this._settings.group) {
      for (let g in this._settings.group) {
        filterFlags[this._settings.group[g].key] = {
          count: -1
        };
      }
    }
    this.filterFlags = filterFlags;
  }

  resetSelectedDropdown() {
    this.dropdownOptions.forEach((ele: any) => {
      ele.isCurrent = false;
    });
  }

  @Output() confirmOptions = new EventEmitter<any>();

  closeDropdown(event?: any) {
    this.confirmOptions.emit();
  }

  /**
   *
   * @param filterText
   */
  filterDropdown(filterText: any) {
    this.dropdownOptions.forEach((ele: DropdownOptionModel) => {
      // 不要求精确匹配，使用!=而不是!==
      if (ele.hasOwnProperty('key')) {
        let key = ele.key.toLowerCase();
        let filter = filterText.toLowerCase();
        ele.hasFiltered = key.indexOf(filter) == '-1';
      }
    });
    let filterFlags = {};
    if (this._settings.group) {
      for (let g in this._settings.group) {
        filterFlags[this._settings.group[g].key] = {
          count: filterText !== '' ? 0 : -1
        };
      }
    }
    this.dropdownOptions.forEach((ele: DropdownOptionModel) => {
      // 不要求精确匹配，使用!=而不是!==
      if (!ele.hasFiltered && filterFlags.hasOwnProperty(ele.group)) {
        filterFlags[ele.group].count += 1;
      }
    });
    this.filterFlags = filterFlags;
  }

  switchGroup(event: any, group: any) {
    event.stopPropagation();
    this.currentGroup = group;
  }

  isGroupSelectAll(group: any): boolean {
    if (this.selectedOptions.length > 0) {
      let count = 0;
      for (let k in this.selectedOptions) {
        if (this.selectedOptions.hasOwnProperty(k) && this.selectedOptions[k].hasOwnProperty('group')
          && this.selectedOptions[k].group == group.key) {
          count++;
        }
      }
      let total = 0;
      for (let i in this.dropdownOptions) {
        if (this.dropdownOptions.hasOwnProperty(i) && this.dropdownOptions[i].hasOwnProperty('group')
          && this.dropdownOptions[i].group == group.key) {
          total++;
        }
      }
      return count !== 0 && count === total;
    } else {
      return false;
    }
  }

  toggleChooseAll(event: any, group: any) {
    event.stopPropagation();
    let ele = event.target;
    // 判定删除还是选中所有
    let oldStatus = this.isGroupSelectAll(group);
    let newStatus = !oldStatus;
    let tmpArr: Array<any> = [];
    for (let i in this.dropdownOptions) {
      if (this.dropdownOptions.hasOwnProperty(i) && this.dropdownOptions[i].hasOwnProperty('group')) {
        if (this.dropdownOptions[i].group == group.key) {
          this.dropdownOptions[i].isCurrent = newStatus;
          if (newStatus) {
            tmpArr.push(this.dropdownOptions[i]);
          }
        }
      }
    }
    // 清空选中项中和此组有关内容
    for (let i = this.selectedOptions.length - 1; i >= 0; i--) {
      if (this.selectedOptions.hasOwnProperty(i)) {
        let ele = this.selectedOptions[i];
        if (ele.hasOwnProperty('group')) {
          if (ele.group == group.key) {
            this.selectedOptions.splice(i, 1);
          }
        }
      }
    }
    //如果是添加，将所有选项加入选中项
    if (newStatus && tmpArr.length) {
      tmpArr.forEach((ele: any) => {
        this.selectedOptions.push(ele);
      });
    }
    this.outDropdownElementClickEvent.emit([[], newStatus ? 'add' : 'delete']);
  }

  dropdownElementClick(event: any, option: any) {
    event.stopPropagation();
    let oldStatus = option.isCurrent;
    let newStatus = !oldStatus;
    // 不管添加还是删除，查看是否有验证事件
    let allowAdd = true;
    let allowDelete = true;
    let execResult = false;
    if (newStatus) {
      if (typeof this.settings.addEvent === 'function') {
        allowAdd = this.settings.addEvent(option);
      }
    } else {
      if (typeof this.settings.removeEvent === 'function') {
        allowDelete = this.settings.removeEvent(option);
      }
    }
    if (this.settings.isMultiple) {
      if (newStatus === true && allowAdd) {
        this.selectedOptions.push(option);
        execResult = true;
      } else if (this.selectedOptions && allowDelete) {
        for (let k in this.selectedOptions) {
          if (this.selectedOptions.hasOwnProperty(k) && this.selectedOptions[k].hasOwnProperty('id') &&
            this.selectedOptions[k].id === option.id && option.id !== this.userDataService.getCurrentCompanyPSID()) {
            this.selectedOptions.splice(parseInt(k), 1);
            execResult = true;
            break;
          }
        }
      }
      if (execResult) {
        for (let j in this.dropdownOptions) {
          if (this.dropdownOptions[j].id === option.id) {
            this.dropdownOptions[j].isCurrent = newStatus;
          }
        }
        //option.isCurrent = newStatus;
      }
    } else {
      // 单选
      this.selectedOptions = [];
      this.resetSelectedDropdown();
      if (!oldStatus && allowAdd) {
        option.isCurrent = !oldStatus;
        this.selectedOptions.push(option);
        execResult = true;
      } else if (allowDelete) {
        this.selectedOptions = [];
        execResult = true;
      }
      this.openStatus = false;
      this.closeDropdown();
    }
    if (execResult) {
      this.outDropdownElementClickEvent.emit([option, newStatus ? 'add' : 'delete']);
    }

  }
}