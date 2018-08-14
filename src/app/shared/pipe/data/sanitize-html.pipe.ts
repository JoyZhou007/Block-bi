import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {Pipe, PipeTransform} from "@angular/core";
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/5/16.
 */
@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) {
  }

  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}