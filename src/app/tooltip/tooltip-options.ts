import {ViewContainerRef} from "@angular/core";
/**
 * Created by Summer Yang(summer.yang@blockbi.com)
 * on 2017/6/22.
 */

export interface TooltipOptions {
  position: string;
  content: string;
  popupClass: string;
  margin: number;
  trigger: {
    on: string;
    off?: string;
  };
  x: number,
  y: number,
  dismissable: boolean;
  active: boolean;
  viewContainer: any;
  maxWidth: number;
  isCloseBut: boolean;
}


export interface PositionDescription {
  horizontal: string;
  vertical: string;
}
