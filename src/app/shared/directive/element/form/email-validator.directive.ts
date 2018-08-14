/**
 * Created by christine on 2017/6/29.
 */
import {Directive, forwardRef} from '@angular/core';
import {NG_VALIDATORS, FormControl} from '@angular/forms';

function validateEmailFactory() {
  return (c: FormControl) => {
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    let errorText = '';
    if (c.value === '') {
      errorText = 'Email is required';
    } else {
      errorText = 'Email format is not correct';
    }
    return EMAIL_REGEXP.test(c.value) ? null : {
        validateEmail: {
          valid: false,
          text: errorText
        }
      };
  };
}

@Directive({
  selector: '[validateEmail][ngModel],[validateEmail][formControl]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => EmailValidator), multi: true}
  ]
})
export class EmailValidator {
  validator: Function;

  constructor() {
    this.validator = validateEmailFactory();
  }

  validate(c: FormControl) {
    return this.validator(c);
  }
}