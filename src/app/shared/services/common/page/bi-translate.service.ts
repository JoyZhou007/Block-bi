/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/7/17.
 */
import {TranslateService} from "@ngx-translate/core";
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class BiTranslateService {
  private _lan: string;
  private manualTranslateResult: string;

  get lan() {
    if (!this._lan) {
      this.detectLanguage();
    }
    return this._lan;
  }

  constructor(public translate: TranslateService,
              @Inject('user-data.service') public userDataService: any,
              ) {
    this.detectLanguage();
  }

  detectLanguage() {
    let storeLan = this.userDataService.getLanguage();
    if (!storeLan) {
      let browserLan = this.translate.getBrowserCultureLang().toLowerCase();
      let lanArr = ['en', 'zh-cn'];
      // let lanArr = ['en'];
      this.translate.addLangs(lanArr);
      let lan = 'en';
      if (lanArr.indexOf(browserLan) !== -1) {
        lan = browserLan;
      }
      // this language will be used as a fallback when a translation isn't found in the current language
      this.translate.setDefaultLang(lan);
      // the lang to use, if the lang isn't available, it will use the current loader to get them
      this.saveLan(lan);
    } else {
      this.translate.use(storeLan);
      this._lan = storeLan;
    }
    this.addBodyClass(this._lan);
  }

  saveLan(lan: string) {
    this.translate.use(lan);
    this.userDataService.setLanguage(lan);
    this._lan = lan;
    this.addBodyClass(this._lan);
  }

  switchLan(lan: string) {
    this.saveLan(lan);
  }

  manualTranslate(data: any) {
    if(!data) return;
    this.translate.get(data).subscribe((res: string) => {
      this.manualTranslateResult = res;
    });
    return this.manualTranslateResult;
  }

  addBodyClass(type: string){
    let body = document.querySelector('body');
    if(type == 'en'){
      let inputClass = body.className;
       inputClass = inputClass.trim();
      inputClass = inputClass.replace('lan-zh', '');
      inputClass = inputClass.replace('lan-en', '');
      body.setAttribute('class', inputClass + ' lan-en');

    }else if(type == 'zh-cn'){
      let inputClass = body.className;
      inputClass = inputClass.trim();
      inputClass = inputClass.replace('lan-en', '');
      inputClass = inputClass.replace('lan-zh', '');
      body.setAttribute('class', inputClass + ' lan-zh');
    }

  }

}