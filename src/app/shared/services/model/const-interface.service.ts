import {Component, Inject, Injectable, OnInit} from '@angular/core';
import {PersonalModelService, AllCompanyInfo} from '../index.service';


@Injectable()
export class ConstInterFaceService extends PersonalModelService {

  private COUNTRY_LIST: string = 'country_list';
  private INDUSTRY_LIST: string = 'industry_list';
  private BANK_LIST: string = 'bank_list';

  constructor(@Inject('api.service') public api: any,
              @Inject('type.service') public typeService: any,
              @Inject('store.service') public storeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('bi-translate.service') public translate: any,
              @Inject('app.config') public config: any,
              @Inject('company-data.service') public companyDataService: any) {
    super(api);
  }

  /**
   * 获取缓存数据
   * @param key
   */
  getStoreData(key: string) {
    this.storeService.getInstance().get(key);
  }

  /**
   * 设置数据缓存
   * @param key
   * @param data
   */
  setStoreData(key: string, data: any) {
    this.storeService.getInstance().set(key, data);
  }

  /**
   * 清楚缓存
   * @param key
   */
  removeStoreData(key: string) {
    this.storeService.getInstance().remove(key);
  }

  /**
   * 银行初始化
   * @param type
   * @param callBack
   */
  initBank(type: number, callBack?: any) {
    // let storeBankList: any = this.storeService.getInstance().get(this.BANK_LIST);
    // if (storeBankList) {
    //   this.bankDataList(type, storeBankList, callBack);
    // } else {
    //
    // }
    this.banksList(
      (data: any) => {
        if (data.status === 1) {
          this.setStoreData(this.BANK_LIST, data.data);
          this.bankDataList(type, data.data, callBack);
        }
      }
    );
  }

  bankDataList(type: number, data: any, callBack?: any) {
    let shortName: string;
    let bankList: any[] = [];
    for (let key in data) {
      bankList.push(data[key]);
      if (parseInt(data[key].id) === type) {
        shortName = data[key].short_name;
      }
    }

    if (callBack) {
      callBack(shortName, bankList);
    }
  }

  /**
   * 国家初始化
   * @param type
   * @param callBack
   */
  initCountry(type: string, callBack?: any) {
    this.queryJson(
      'GET',
      this.config.staticResourceDomain + 'assets/json/country.json',
      '',
      (data: any) => {
        this.setStoreData(this.COUNTRY_LIST, data);
        this.countryDataList(type, data, callBack);
      }
    );
  }

  countryDataList(type: string, data: any, callBack?: any) {
    let countryArr: any = {chs: [], en: []};
    let currChs: string;
    countryArr['setData'] = data;
    for (let key in data) {
      countryArr.chs.push(data[key].chs);
      countryArr.en.push(data[key].en);
      if (data[key].code === type) {
        if (this.translate.lan == 'zh-cn') {
          currChs = data[key].chs;
        } else if (this.translate.lan == 'en') {
          currChs = data[key].en;
        }
      }
    }

    if (callBack) {
      callBack(currChs, countryArr);
    }
  }

  /**
   * 性别初始化
   * @param type
   */
  transformGender(type: number): string {
    let gender: string;
    switch (type) {
      case 1:
        gender = 'MALE';
        break;
      case 2:
        gender = 'FEMALE';
        break;
      default:
        gender = 'OTHER';
        break;
    }
    return gender;
  }

  /**
   * 公司行业
   * @param type
   * @param callBack
   */
  companyIndustry(type: number, callBack?: any) {
    // let storeIndustryList: any = this.storeService.getInstance().get(this.INDUSTRY_LIST);
    // if (storeIndustryList) {
    //   this.industryDataList(type, storeIndustryList, callBack);
    // } else {
    //
    // }
    this.queryJson(
      'GET',
      this.config.staticResourceDomain + 'assets/json/industry.json',
      '',
      (data: any) => {
        this.setStoreData(this.INDUSTRY_LIST, data);
        this.industryDataList(type, data, callBack);
      }
    );
  }

  industryDataList(type: number, data: any, callBack?: any) {
    let industryArr: any[] = data;
    let industry: any = data[type - 1];
    if (callBack) {
      callBack(industry, industryArr);
    }
  }


  /**
   * 更新本地公司列表
   * @param callBack
   */
  updateCompanyList(callBack?: any) {
    this.getAllCompany((data: any) => {
      if (data.status === 1) {
        let companiesInformation: any = this.typeService.bindDataList(AllCompanyInfo.init(), data.data.companies_information);
        this.companyDataService.setAllCompany(companiesInformation, false);
        let isBool: boolean = false;
        let currentCompanyInfo: any;
        let companyList: any = this.companyDataService.getAllCompany();
        let localCompany: any = this.companyDataService.getLocationCompanyIn();
        for (let key in companyList) {
          if (parseInt(companyList[key].cid) === parseInt(localCompany.cid)) {
            isBool = true;
            currentCompanyInfo = companyList[key];
            break;
          }
        }
        this.companyDataService.setLocationCompanyIn(isBool ? currentCompanyInfo : companyList[0]);
        if (callBack) {
          callBack(companiesInformation);
        }
      } else {
        this.dialogService.openError({simpleContent: 'fetch company list failed!'});
      }
    })
  }
}
