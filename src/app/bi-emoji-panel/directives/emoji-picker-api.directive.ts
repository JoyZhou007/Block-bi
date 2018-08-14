import {
  Directive,
  Input,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Output
} from '@angular/core';
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/distinctUntilChanged';

import { EmojiPickerComponent } from './../components';
import { DIRECTIONS } from '../lib/picker-directions';
import { Subscription } from "rxjs/Subscription";
import { EmojiEvent } from "../lib";

@Directive({
  selector: '[emojiPickerIf]',
  host: {
    '(mousedown)': '$event.emojiPickerExempt = true' // marking off event listening on anchor
  }
 })
export class EmojiPickerApiDirective {
  private _directionCode: DIRECTIONS = DIRECTIONS.bottom;

  /** [emojiPickerDirection]="'top' || 'bottom' || 'left' || 'right'" defaults to 'bottom' */
  @Input('emojiPickerDirection') set emojiPickerDirection(direction: string) {
    if (DIRECTIONS[direction] === undefined) {
      this._directionCode = DIRECTIONS.bottom;
    } else {
      this._directionCode = DIRECTIONS[direction];
    }
  }

  /** [emojiPickerPreserveSelection]="true || false" preserves or forgets prexisting selection while toggling picker */
  @Input('emojiPickerPreserveSelection') emojiPickerPreserveSelection: boolean;

  /** [(emojiPickerIf)]="true || false" opens up or closes the picker */
  @Input('emojiPickerIf') set emojiPickerIf(condition: boolean) {
    this._emojiPickerOpenState.next(condition);
  }
  @Output('emojiPickerIfChange') emojiPickerIfEmitter = new EventEmitter<boolean>();

  /** (emojiPickerSelect)="eventHandler($event)" // emits emoji picking event */
  @Output('emojiPickerSelect') selectEmitter = new EventEmitter();

  /** [emojiPickerAutofocus]="true || false"  */
  @Input('emojiPickerAutofocus') emojiPickerAutofocus: boolean;

  private _emojiPickerOpenState = new Subject<boolean>();
  private _destroyed = new Subject<boolean>();

  private _emojiPickerFactory: ComponentFactory<EmojiPickerComponent>;
  private _emojiPickerRef: ComponentRef<EmojiPickerComponent>;
  private _emojiSubs: Subscription[] = [];

  private _recordedSelection;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private _vcr: ViewContainerRef,
    private _el: ElementRef
  ) {
    this._emojiPickerOpenState
      .takeUntil(this._destroyed)
      .distinctUntilChanged()
      .subscribe(value => {
        if (value) {
          this.openPicker();
        } else {
          this.closePicker();
        }
      });
  }

  openPicker() {
    this._emojiPickerFactory = this._emojiPickerFactory || this._cfr.resolveComponentFactory(EmojiPickerComponent);
    this._emojiPickerRef = this._emojiPickerRef || this._vcr.createComponent(this._emojiPickerFactory);

    this.recordSelection();

    this._emojiPickerRef.instance.setPosition(this._el, this._directionCode);
    this._emojiPickerRef.instance.setAutofocus(this.emojiPickerAutofocus);
    this._emojiSubs.push(
      this._emojiPickerRef.instance.pickerCloseEmitter.subscribe(event => this.emojiPickerIfEmitter.emit(false)),
      this._emojiPickerRef.instance.selectionEmitter.subscribe(event => this.selectEmitter.emit(EmojiEvent.fromArray(event)))
    );

    this.restoreSelection();
  }

  closePicker() {
    if (!this._emojiPickerRef || !this._emojiPickerRef.destroy) {
      return;
    }
    // only hide
    this._emojiPickerRef.instance.hideComponent();
    // this._emojiSubs.forEach((subscription: Subscription) => subscription.unsubscribe());
    // this._emojiPickerRef.destroy();
    //
    // this._emojiSubs = [];
    // delete this._emojiPickerRef;
  }

  recordSelection() {
    if (!this.emojiPickerPreserveSelection) {
      return;
    }

    if (window.getSelection) {
      let sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return this._recordedSelection = sel.getRangeAt(0);
      }
    } else if (document['selection'] && document['selection'].createRange) {
      return this._recordedSelection = document['selection'].createRange();
    }
  }

  restoreSelection() {
    if (!this.emojiPickerPreserveSelection || !this._recordedSelection) {
      return;
    }

    if (window.getSelection) {
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(this._recordedSelection);
    } else if (document['selection'] && this._recordedSelection.select) {
      this._recordedSelection.select();
    }
  }

  ngOnDestroy() {
    this._destroyed.next(true);
  }
}
