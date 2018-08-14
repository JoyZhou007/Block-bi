import {
  Component, OnInit, AfterViewChecked, ViewChild, Output, EventEmitter, Input, Inject,
  ViewEncapsulation
} from '@angular/core';
import {OfflineOptions, ControlAnchor, NavigationControlType} from 'angular2-baidu-map';
import * as MissionConstant from '../../shared/config/mission.config';
import {MissionModelService} from "../../shared/services/index.service";
import {MissionTPLTrackingData, MissionUserInfo} from "../../shared/services/model/entity/mission-entity";

@Component({
  selector: 'map-presentation',
  templateUrl: './../template/mission-map.component.html',
  encapsulation: ViewEncapsulation.None,
})
/**
 * 列表pin的属性
 * {
 *  desc：//描述
    id    //pin id
    isCurrent  //当前是否选中
    isPin      //是否是pin
    lat        //纬度
    lng        //经度
    pin_index  //pin索引
    user_info   //用户信息
 * }
 *
 */
export class MissionMapComponent implements OnInit, AfterViewChecked {
  public pinClass: string = 'userPin';
  public baiduIsSet: boolean = false;
  public bMap: any;
  public baiduMap: any;
  public akKey: string = 'Wcy2CwcQNEFP2aG03R2s9CvRoPEpUmpm';
  public opts: any;
  public offlineOpts: OfflineOptions;
  public isShowPingBox: boolean = false;
  public clickedOnMarker: boolean = false;
  public lat: number;
  public lng: number;
  public desc: string = '';
  public token: string;
  public currentModel: string;
  public missionDetailData: any;
  public isHasTracker: boolean = false;
  public trackData: any;
  /**
   * 分页地图人物列表
   */
  public trackIndex: number = 0;//当前翻到第几页
  public trackMaxIndex: number = 0;//最大翻几次页
  public trackPageNum: number = 5;//每页显示个数
  public clickIndex: number;//当前操作列表项的索引
  public trackDataList: Array<MissionTPLTrackingData> = [];//循环输出头像，pin
  public moveLeft: number = 0;//列表向左移动的距离
  public moveIndex: number = 0;//已经移动隐藏了几个头像
  public pinNum: number = 0;//添加了几个pin
  public generalToken: string;
  public isShowError: boolean = false;
  public loadAll: boolean = false;  //全部加在完成
  private currentType: any;

  constructor(public missionModelService: MissionModelService,
              @Inject('type.service') private typeService: any,
              @Inject('dialog.service') public dialogService: any,
              @Inject('app.config') public config: any) {
  }

  ngAfterViewChecked(): void {
    let windowBMap = (<any>window)['BMap'];
    if (!this.baiduIsSet && typeof this.bMap === 'undefined' && typeof windowBMap !== 'undefined') {
      this.bMap = windowBMap;
      this.bindEvent(this.baiduMap);
      this.baiduIsSet = true;
    }
  }

  @Input() set setParams(param: any) {
    this.currentModel = param;
  }

  @Input() set setCurrentType (param: any) {
    this.currentType = param;
  }

  @Input() set setMissionToken(generalToken: any) {
    if (generalToken) {
      this.generalToken = generalToken.token;
    }
  }


  @Input() set setMissionDetail(param: any) {
    this.missionDetailData = param;
  }


  ngOnInit() {
    this.opts = {
      center: {
        longitude: 121.452911,
        latitude: 31.195201
      },
      zoom: 17,
      geolocationCtrl: {
        anchor: ControlAnchor.BMAP_ANCHOR_BOTTOM_RIGHT
      },
      scaleCtrl: {
        anchor: ControlAnchor.BMAP_ANCHOR_BOTTOM_LEFT
      },
      overviewCtrl: {
        isOpen: true
      },
      navCtrl: {
        type: NavigationControlType.BMAP_NAVIGATION_CONTROL_LARGE
      }
    };
    this.offlineOpts = {
      retryInterval: 5000,
      txt: 'NO-NETWORK'
    };

  }

  /**
   * people logo list page
   * @param page
   */
  trackPage(page: number) {
    this.trackMaxIndex = Math.ceil(this.trackDataList.length / this.trackPageNum);
    //向前翻页
    if (page === -1) {
      if (this.moveIndex === 0) {
        return false;
      }
      if (this.moveIndex > 0) {
        this.moveIndex--;
      }
      this.moveLeft += 28;

      //向后翻页
    } else if (page === 1) {
      if (this.moveIndex >= this.trackDataList.length - 5) {
        return false;
      } else {
        this.moveIndex++;
      }
      this.moveLeft -= 28;
    }
  }

  loadMap(map: any) {
    this.baiduMap = map;
    let self = this;
    if( this.baiduMap){
      // this.baiduMap.clearOverlays();
      map.addEventListener('click', (event: any) => {
        this.lat = event.point.lat;
        this.lng = event.point.lng;
        this.desc = '';
        this.isShowPingBox = true;
      });
      this.bindEvent(map);
      map.addEventListener('tilesloaded', self.addTilesLoaded(map));
    }
  }

  bindEvent(map:any){
    if (this.bMap && this.bMap.Autocomplete) {
      let ac = new this.bMap.Autocomplete(    //建立一个自动完成的对象
        {
          "input": "suggestId",
          "location": map
        });
      ac.addEventListener("onhighlight", (e: any) => {  //鼠标放在下拉列表上的事件
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;


        if (e.toitem.index > -1) {
          _value = e.toitem.value;
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
      });
      var myValue;
      ac.addEventListener("onconfirm", (e: any) => {    //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
    /*    map.clearOverlays();    //清除地图上所有覆盖物*/
        this.setPlace(myValue);
      });
    }
  }

  /**
   * 地图加载完成的回调函数
   * @param map
   */
  addTilesLoaded(map) {
   //如果有track,先将track列表添加到数组中
    if (this.missionDetailData) {
      if(this.missionDetailData.type == MissionConstant.MISSION_TYPE_APPLICATION) return;
      let data = {mid: this.missionDetailData.mid};
      this.missionModelService.missionMapPinList({data: data}, (response: any) => {
        if (this.missionDetailData && this.missionDetailData.fns.hasOwnProperty(MissionConstant.MISSION_FUNCTION_TRACKING)) {
          this.isHasTracker = true;
          let trackerArr = this.typeService.clone(this.missionDetailData.fns[MissionConstant.MISSION_FUNCTION_TRACKING]);
          let tmpArr = [];
          if (trackerArr.length) {
            for (let i in trackerArr) {
              let trackObj = new MissionTPLTrackingData().init();
              let userInfo = new MissionUserInfo().init();
              this.typeService.bindData(userInfo, trackerArr[i].user_info);
              trackObj.initUserInfo(userInfo);
              this.typeService.bindData(trackObj, trackerArr[i]);
              tmpArr.push(trackObj);
            }
          }
          this.trackDataList = tmpArr;
        } else {
          this.trackDataList = [];
          this.isHasTracker = false;
        }

        //如果有请求到pin列表，将pin列表添加到数组中
        if (response.status === 1 && response.data && response.data.length) {
          this.pinNum = 0;
            for (let i in response.data) {
              let obj = new MissionTPLTrackingData().init();
              this.typeService.bindData(obj, response.data[i]);
              this.trackDataList.push(obj);
          }
        }
        //数组赋值完毕开始画图
        if (this.trackDataList) {
          this.drawMarker();
        }
      });
    }
    map.removeEventListener("tilesloaded");
    setTimeout(()=>{
      this.loadAll = true;
    },3000);
  }



  clickMarker(marker: any) {
    marker.addEventListener('infowindowclose', () => {
      this.clickedOnMarker = false;
      this.isShowPingBox = false;
    });
    this.clickedOnMarker = true;
  }

  updateCoordinate(e: MouseEvent) {
    this.opts = {
      center: {
        longitude: 121.500885,
        latitude: 31.190032
      }
    };
  }

  setPlace(myValue: any) {
    let local = new this.bMap.LocalSearch(this.baiduMap, { //智能搜索
      onSearchComplete: () => {
        let pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
        this.baiduMap.centerAndZoom(pp, 18);
        this.baiduMap.addOverlay(new this.bMap.Marker(pp));    //添加标注
      }
    });
    local.search(myValue);
  }

  /**
   * 取消添加ping
   */
  cancelAddPing(event: any) {
    event.stopPropagation();
    this.isShowPingBox = false;
    this.clickedOnMarker = false;
  }

  /**
   * 确认添加ping
   */
  confirmAddPing(event: any) {
    if(this.desc == '' || this.desc.trim().length == 0){
      this.isShowError = true;
      return false;
    }else{
      this.isShowError = false;
    }
    this.isShowPingBox = false;
    //获取token
    let data = {
      type: MissionConstant.MISSION_GENERAL_TOKEN
    };
    if (this.missionDetailData) {
      this.addPing(event);
    } else {
      this.addPing(event, this.generalToken);
    }

  }

  /**
   * 添加ping
   * @param token
   * @param event
   */
  addPing(event: any, token?: string) {
    let data = {
      mid: this.missionDetailData ? this.missionDetailData.mid : '0',
      general_token: typeof token === "undefined" ? '' : token,
      lng: this.lng,
      lat: this.lat,
      source: '0', // baidu地图是0
      desc: this.desc
    };
    this.missionModelService.missionMapPin({
      data
    }, (data: any) => {
      if (data.status === 1) {
        this.drawPin(this.desc, this.lng, this.lat, this.pinNum, data.data.map_id);
        //添加pin到下面的列表中
        let pushObj = new MissionTPLTrackingData().init();
        pushObj.initPinIndex(this.pinNum);
        this.typeService.bindData(pushObj, {
          lng: this.lng,
          lat: this.lat,
          isPin: true
        });
        this.trackDataList.push(pushObj);
        this.pinNum++;
        this.clickIndex = this.trackDataList.length - 1;
        this.baiduMap.centerAndZoom(new this.bMap.Point(this.lng, this.lat));
        this.baiduMap.panTo(new this.bMap.Point(this.lng, this.lat));
      }else{
        this.dialogService.openError({simpleContent: 'add pin failed!'});
      }
    })
  }

  drawMarker(event?: any) {
    if (this.trackDataList) {
      this.trackDataList.forEach((obj: MissionTPLTrackingData, i) => {
        if (obj.isPin) {
          this.drawPin(obj.description, obj.lng, obj.lat, obj.pin_index, obj.map_id);
        } else {
          if (!obj.lat) {
            obj.lat = 31.195201 + i / 1000;
          }
          if (!obj.lng) {
            obj.lng = 121.452911 + i / 1000;
          }
          this.drawUser(event, obj, i);
        }
      })

    }
  }

  /**
   * 绘画pin
   */
  drawPin(desc: string, lng: any, lat: any, pinIdx: number, pinId: any) {
    let id = pinId;
    if (!this.bMap) {
      this.bMap = (<any>window)['BMap'];
    }
    let point = new this.bMap.Point(lng, lat);
    let shape = 'M10,0 C4.49152542,0 0,4.41885856 0,9.8382134 C0,14.1736973 6.18644068,20.248139 8.81355932,23.4163772 C9.06779661,23.7498759 9.57627119,24 10,24 C10.4237288,24 10.9322034,23.8332506 11.1864407,23.4163772 C13.8135593,20.248139 20,14.1736973 20,9.8382134 C20,4.41885856 15.5084746,0 10,0 Z M16.2893462,9.08784119 C16.2893462,12.5253929 13.4940812,15.2754342 10,15.2754342 C6.50591875,15.2754342 3.71065375,12.5253929 3.71065375,9.08784119 C3.71065375,5.6502895 6.50591875,2.90024814 10,2.90024814 C13.4940812,2.90024814 16.2893462,5.6502895 16.2893462,9.08784119 Z';
    let symbol = new this.bMap.Symbol(shape
      , {
        rotation: 0,//顺时针旋转40度
        fill: '#080808',
        fillOpacity: 0.8,
        strokeColor: '#080808',
        //background: 'http://localhost:3000/assets/images/news-phone.jpg',
        strokeWeight: 3,//线宽
        anchor: new this.bMap.Size(10, 18)
      });
    let marker = new this.bMap.Marker(point, {
      // 设置自定义path路径
      icon: symbol
    });
    marker.addEventListener('click', () => {
      this.clickMarker(marker);
    });
    this.baiduMap.addOverlay(marker);

    let label = new this.bMap.Label(desc, {
      offset: new this.bMap.Size(-39, 40)
    });
    label.setStyle({
      width: "100px",
      color: '#fff',
      background: '#31302E',
      border: '1px solid "#ff8355"',
      borderRadius: "5px",
      textAlign: "center",
      fontFamily: 'HelveticaNeue-Bold, Helvetica Neue',
      height: "20px",
      fontSize: '12px',
      lineHeight: "20px"
    });
    let _tmpThis = this;
   setTimeout(function () {
      let oLabel: any = label.V || label.U;
      if(oLabel){
        this.removePin = function (evt, self, event: any) {
          let pinIndex: number = parseInt(event.getAttribute('data-index'));
          let id: number = parseInt(event.getAttribute('data-id'));
          evt.stopPropagation();
          self.parentNode.parentNode.removeChild(self.parentNode);//移除canvas
           // 调取删除pin接口
          _tmpThis.missionModelService.removeMapPin({
            data: {map_id: id, general_token: _tmpThis.token}
          }, (data: any) => {
            if (data.status === 1) {
              let pinList = document.getElementsByClassName("my-pins");
              //删除对应列表中pin
              for (let n = 0; n < _tmpThis.trackDataList.length; n++) {
                if (_tmpThis.trackDataList[n].pin_index == pinIndex) {
                  _tmpThis.trackDataList.splice(n, 1);
                 if(_tmpThis.clickIndex == n){
                   _tmpThis.clickIndex = -1;
                 }else if(_tmpThis.clickIndex > n){
                   _tmpThis.clickIndex -= 1;
                 }
                  if (_tmpThis.moveIndex >= 1) {//不是点击第一页的则向前移动一个
                    _tmpThis.moveLeft += 28;
                    _tmpThis.moveIndex--;
                  }
                }
              }
            } else if (data.status === 0) {
            }
          });

        };
        oLabel.innerHTML += '<span class="font-remove closeBtn" data-index = "' + pinIdx + '" data-id="' + id + '" style="z-index:' + pinIdx + '" ' +
          'onclick="window.removePin(event, this.parentNode, this)"></span>';
      }
    }, 2000);

    marker.setLabel(label);

  }

  /**
   *  绘制user
   */
  drawUser(event: any, obj: MissionTPLTrackingData, i: number) {
    if (!this.bMap) {
      this.bMap = (<any>window)['BMap'];
    }
    let shape = 'M18,40.5 C18,40.5 24.3847077,35.114224 27.0416614,33.5677461 C32.3988904,30.449575 36,24.6453296 36,18 C36,8.0588745 27.9411255,0 18,0 C8.0588745,0 0,8.0588745 0,18 C0,24.6653489 3.62283917,30.4845384 9.00680284,33.5958537 C11.6528252,35.1249521 18,40.5 18,40.5 Z';
    //TODO: 动态获取用户坐标
    let point: any = new this.bMap.Point(obj.lng, obj.lat);
    this.baiduMap.panTo(point);
    let userInfo = obj.user_info;
    let marker = new this.bMap.Marker(point, {
      // 设置自定义path路径25325l99
      icon: new this.bMap.Symbol(shape
        , {
          rotation: 0,//顺时针旋转40度
          fill: '#000000',
          fillOpacity: 0.8,
          strokeColor: '#000000',
          strokeWeight: 3//线宽
        })
    });
    //添加覆盖物
    this.baiduMap.addOverlay(marker);
    //定义提示信息
    let label = new this.bMap.Label(this.desc, {
      offset: new this.bMap.Size(-30, 50)
    });
    //设置提示信息样式
    label.setStyle({
      width: "100px",
      color: '#fff',
      background: '#31302E',
      border: '1px solid "#ff8355"',
      borderRadius: "5px",
      textAlign: "center",
      fontFamily: 'HelveticaNeue-Bold, Helvetica Neue',
      height: "20px",
      fontSize: '12px',
      lineHeight: "20px"
    });
    let _this: any = this; //全局对象
    let oLabel: any;

    //添加事件
    setTimeout(function () {
      oLabel = label.V || label.U;
      if(oLabel && typeof oLabel.parentNode !== 'undefined'){
        this.removeUser = function (event, ts) {//点击 X 事件
          event.stopPropagation();
          _this.clickedOnMarker = false;
          if(typeof ts.parentNode !== 'undefined'){
            ts.parentNode.style.transform = 'scale(.6)';
            ts.parentNode.style.overflow = 'hidden';
            let liList = document.getElementsByClassName('hover');
            for (let i = 0; i < _this.trackDataList.length; i++) {
              if (ts.parentNode.getAttribute('labelIndex') == i) {
                liList[i].className = "hover";
              }
            }
          }
        };
        oLabel.parentNode.setAttribute('class', 'BMap_Marker ' + _this.pinClass);
        oLabel.parentNode.setAttribute('labelIndex', i);

        //设置提示信息内容
        oLabel.innerHTML = userInfo.name;
        oLabel.innerHTML += '<span class="font-remove closeBtn" onclick="window.removeUser(event, this.parentNode)"></span>';
        //插入头像
        if (userInfo.user_profile_path) {
          let oImg: any = new Image();
          oImg.src = _this.config.resourceDomain + userInfo.user_profile_path;
          oImg.setAttribute('class', 'oimg');
          oLabel.parentNode.insertBefore(oImg, oLabel.parentNode.children[0]);
        } else {
          let oSpan = document.createElement("span");
          if(userInfo.p_name){
            oSpan.innerHTML = userInfo.p_name.slice(0, 1);
            oSpan.className = 'oSpan';
            oLabel.parentNode.insertBefore(oSpan, oLabel.parentNode.children[0]);
          }
        }

        oLabel.parentNode.style.overflow = "hidden";
        oLabel.parentNode.style.width = "40px";
        oLabel.parentNode.style.height = "44px";
        oLabel.parentNode.style.transform = "scale(.6)";

        //点击头像事件
        oLabel.parentNode.firstChild.addEventListener('click', (evt: any) => {
          evt.stopPropagation();
          oLabel.parentNode.style.transform = "scale(1)";
          oLabel.parentNode.style.overflow = "visible";
          _this.clickIndex = i;
          if (i - 4 >= 0) {
            _this.moveIndex = i - 4;
            _this.moveLeft = -30 * _this.moveIndex;
          }

        });
      }
    }, 2000);
    marker.setLabel(label);
    // this.baiduMap.panTo(new this.bMap.Point(obj.lng, obj.lat));
  }

  /**
   * 点击pin
   * @param event
   * @param index
   * @param tracker
   */
  clickList(event: any, index, tracker: MissionTPLTrackingData) {
    //保存当前点击的索引
    this.clickIndex = index + this.trackIndex * this.trackPageNum;
    let labelList = document.getElementsByClassName(this.pinClass);
    for (let i = 0; i < labelList.length; i++) {
      let item: any = labelList[i];
      let itemIndex = parseInt(item.getAttribute("labelIndex"));

      if (itemIndex == index + this.trackIndex * this.trackPageNum) {
        this.clickIndex = itemIndex;
        item.style.transform = "scale(1)";
        item.style.overflow = "visible";
      } else {
        item.style.transform = "scale(.6)";
        item.style.overflow = "hidden";
      }
    }
    this.baiduMap.centerAndZoom(new this.bMap.Point(tracker.lng, tracker.lat));
    this.baiduMap.panTo(new this.bMap.Point(tracker.lng, tracker.lat));
  }
}