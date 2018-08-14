/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/3/21.
 */
import { Injectable } from '@angular/core';

function _window() : any {
  // return the global native browser window object
  return window;
}

@Injectable()
export class WindowRef {
  get nativeWindow() : any {
    return _window();
  }
}