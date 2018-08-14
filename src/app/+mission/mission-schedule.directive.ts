import {
  ComponentFactoryResolver, ComponentRef, ContentChild, Directive, ElementRef, HostListener, Input, OnChanges, OnInit,
  Renderer,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
import {MissionDetailAPIModel} from "../shared/services/model/entity/mission-entity";
import {ScheduleOptions} from "./schedule-options";
import {MissionListScheduleComponent} from "./components/mission-list-schedule.component";

/**
 * Created by joyz on 2017/7/14.
 */


@Directive({
  selector: "[mission-list-schedule]"
})

export class ScheduleDirective implements OnInit, OnChanges {

  @HostListener('click', ["$event"]) clickOnBody($event: any) {
    if ( this.schedule) {
      this.hideSchedule();
    }
  }

  @Input("schedule") public scheduleOptions: any;
  @ContentChild("scheduleTemplate") private scheduleTemplate: TemplateRef<Object>;
  private timer: any;
  private schedule: ComponentRef<MissionListScheduleComponent>;
  private scheduleId: string;
  private _: any = window["_"];
  private defaultScheduleOptions: ScheduleOptions = {
    content: [],
    trigger: {
      on: "click",
      off: ""
    },
    active: true,
    viewContainer: ''
  };

  constructor(private viewContainer: ViewContainerRef,
              public elementRef: ElementRef,
              public renderer: Renderer,
              private componentResolver: ComponentFactoryResolver,) {
    this.scheduleId = this._.uniqueId("schedule");
  }

  ngOnInit() {
    if (!this.options.trigger.off) {
      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.on, (event) => {
        if (this.schedule) {
          this.hideSchedule(event);
        } else if (this.options.active === true) {
          this.showSchedule(event);
        }
      });
    } else {
      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.on, (event) => {
        if (!this.schedule && this.options.active === true) {
          this.showSchedule(event);
        }
      });

      this.renderer.listen(this.elementRef.nativeElement, this.options.trigger.off, (event) => {
        if (this.schedule) {
          this.hideSchedule(event);
        }
      });
    }
  }

  ngOnChanges() {
    if (this.options.active === false && this.schedule) {
      this.hideSchedule();
    }
  }

  private showSchedule(event: MouseEvent) {
    let componentFactory = this.componentResolver.resolveComponentFactory(MissionListScheduleComponent);
    // 如果有指定的目标viewContainer 则生成在目标container中
    if (this.scheduleOptions.hasOwnProperty('viewContainer') && typeof this.scheduleOptions.viewContainer.createComponent === 'function') {
      this.schedule = this.scheduleOptions.viewContainer.createComponent(componentFactory);
    } else {
      this.schedule = this.viewContainer.createComponent(componentFactory);
    }

    // this.schedule.instance.parentEl = this.elementRef;
    this.schedule.instance.scheduleOptions = this.options;
    this.schedule.changeDetectorRef.detectChanges();
  }

  private hideSchedule(event?: MouseEvent) {
    this.schedule.destroy();
    this.timer = null;
    //this.$("html").off("click." + this.tooltipId);
    this.schedule = undefined;
  }

  private get options(): ScheduleOptions {
    return this._.defaults({}, this.scheduleOptions || {}, this.defaultScheduleOptions);
  }
}