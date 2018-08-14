import {Injectable, Inject} from '@angular/core';
import {BaseModelService} from './base-model.service';

@Injectable()
export class PersonalModelService extends BaseModelService {

  constructor(@Inject('api.service') public api: any) {
    super(api);
  }

  //personal profile
  //personalInfo(data : any, callback? : any) {
  //    this.getData('personalInfo', data, callback);
  //}

  //教育经历保存
  saveEducations(data: any, callback?: any) {
    this.getData('saveEducations', data, callback);
  }

  //contacts
  //职业读取
  contactsPermission(data?: any, callback?: any) {
    this.getData('contactsPermission', data, callback);
  }

  //获取用户所有页面数据
  getUserInfo(data?: any, callback?: any) {
    this.getData('userInformations', data, callback);
  }

  //银行列表接口
  banksList(callback?: any) {
    this.getData('banksList', null, callback);
  }

  //国家名字接口
  areaCountry(callback?: any) {
    this.getData('areaCountry', null, callback);
  }

  //个人信息保存接口
  userSaveBaseInfo(data: any, callback?: any) {
    this.getData('userSaveBaseInfo', data, callback);
  }

  //语言级别
  languageLevels(callback?: any) {
    this.getData('languageLevels', null, callback);
  }

  //语言列表
  languageList(callback?: any) {
    this.getData('languageList', null, callback);
  }

  //技能保存
  saveSkill(data: any, callback?: any) {
    this.getData('saveSkill', data, callback);
  }

  //技能点赞
  skillPoint(data: any, callback?: any) {
    this.getData('skillPoint', data, callback);
  }

  /**
   * 公司行业
   * @param callback
   */
  // getCompanyIndustry(callback?: any) {
  //   this.getData('companyIndustry', null, callback);
  // }

  //获取所有公司
  getAllCompany(callback?: any) {
    this.getData('getAllCompany', null, callback);
  }

  //skill list
  //queryJson(callback? : any) {
  //    this.getData('assets/json/skill.json', null, callback, 'get');
  //}

  /**
   * 请求json文件
   */
  queryJson(type: string, url: string, data: any, success: any, failed?: any) {

    //创建ajax对象
    let xhr: any = null;

    //XMLHttpRequest主流浏览器AJAX请求方法
    xhr = new XMLHttpRequest();

    //转换 type 类型 不区分大小写
    let typeCase: string = type.toUpperCase();

    //随机数 每次请求生成新的随机数
    let random: number = Math.random();

    //把对象转成字符串
    if (typeof data === 'object') {
      let str: string = '';
      for (let key in data) {
        str += key + '=' + data[key] + '&';
      }
      data = str.replace(/&$/, '');
    }

    //GET请求方法
    if (typeCase == 'GET') {
      if (data) {
        xhr.open('GET', url + '?' + data, true);
      } else {
        //random每次请求接口 防止缓存
        xhr.open('GET', url + '?t=' + random, true);
      }
      xhr.send();

      //POST请求方法
    } else if (typeCase == 'POST') {
      xhr.open('POST', url, true);
      // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
      xhr.send(data);
    }

    //请求成功处理方法
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          //成功返回并且转化对象
          if (xhr.responseText && typeof xhr.responseText === 'string') {
            let text = JSON.parse(xhr.responseText);
            success(text);
          } else {
            success(0);
          }
        } else {
          //失败返回
          if (failed) {
            failed(xhr.status);
          }
        }
      }
    }
  };

}
