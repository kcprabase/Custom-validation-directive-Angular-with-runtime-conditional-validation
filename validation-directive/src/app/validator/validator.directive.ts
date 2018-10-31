import { Directive, forwardRef, Input, ElementRef, Renderer  } from '@angular/core';
import { AbstractControl, Validator, NG_VALIDATORS, Validators } from '@angular/forms';
let validation = require('../../assets/validation.json');

@Directive({
  selector: '[zen-validator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ValidatorDirective), multi: true
    },
  ]
})
export class ValidatorDirective implements Validator {
  //private
  private json: any;
  private control: AbstractControl
  private validationSet: boolean = false;

  @Input('zen-validator')
  set value(val: any) {
    this.json = val;
    if (this.validationSet) {
      this.validate(this.control);
    }
  }

  tagName: any;
  eventName: string = 'focusout';
  constructor(private el: ElementRef, private renderer: Renderer) {

    renderer.listen(el.nativeElement, this.eventName, (event) => {
      if (this.json == undefined || this.json == null) return;
      this.handleClienValidation(event);
    });
  }

  getValidator(property) {
    if (!property) return;
    if (typeof property === "object") {
      this.json = property;
      return;
    }
    let arr = property.split('.');
    this.json = validation[arr[0]][arr[1]];
  }

  validate(c: AbstractControl) {
    if (!this.validationSet)
      this.control = c;

    c.clearValidators();
    c.updateValueAndValidity();

    this.getValidator(this.json);
    if (this.json == undefined || this.json == null) return;

    if (this.json == "") {
      return null;
    }
    let validators = [];
    if (this.json.hasOwnProperty("required") && this.json.required == true) {
      validators.push(Validators.required);
    }
    if (this.json.hasOwnProperty("maxLength")) {
      validators.push(Validators.maxLength(this.json.maxLength));
    }
    if (this.json.hasOwnProperty("minLength")) {
      validators.push(Validators.minLength(this.json.minLength));
    }
    if (this.json.hasOwnProperty("max")) {
      validators.push(Validators.max(this.json.max));
    }
    if (this.json.hasOwnProperty("min")) {
      validators.push(Validators.min(this.json.min));
    }
    if (this.json.hasOwnProperty("pattern")) {
      validators.push(Validators.pattern(this.json.pattern));
    }
    c.setValidators(validators);

    if (this.validationSet)
      c.updateValueAndValidity();
    //only to set validation after initially set.. dynamic validation change
    this.validationSet = true;

    return null;
  }

  //validate(c: AbstractControl): ValidationErrors {
  //    throw new Error("Method not implemented.");
  //}

  handleClienValidation(event: any) {
    let el = event.target;
    let value = el.value;
    if (value === undefined) {
      value = el.getAttribute('ng-reflect-model');
    }
    if (this.json.type == "number") {
      value = +value;
    }
    let name = this.el.nativeElement.getAttribute('name');
    //console.log("value:", value, "event:", event.type, "element:", name, "\nElement type: ", el.nodeName);
    //if (el.classList.contains("k-input")) {
    //    console.log("is kendo input");
    //} if (el.nodeName == "MAT-SELECT") {
    //    console.log("is material select");
    //}

    let error = '';
    this.clearError(this.outerMostParent(el));

    if (this.json.hasOwnProperty("maxLength") && value.length > this.json.maxLength) {
      error = `Length exceeds maximum allowed length of ${this.json.maxLength}`;
    }
    if (this.json.hasOwnProperty("minLength") && value.length < this.json.minLength) {
      error = `Length is under minimum allowed length of ${this.json.minLength}`;
    }
    if (this.json.hasOwnProperty("max") && value > this.json.max) {
      error = `Value is over maximum of ${this.json.max}`;
    }
    if (this.json.hasOwnProperty("min") && value < this.json.min) {
      error = `Value is under minimum of ${this.json.min}`;
    }
    if (this.json.hasOwnProperty("pattern")) {
      let regexp = new RegExp(this.json.pattern);
      if (!regexp.test(value.trim())) {
        error = `Wrong Format (${this.json.pattern})`;
      }
    }
    if (this.json.hasOwnProperty("type")) { }
    if (this.json.hasOwnProperty("required") && this.json.required && (value == null || value == "")) {
      error = `The ${name} field is required`;
    }

    if (error) {
      this.addErrorBlock(el, error);
    }
    //if (!el.validity.valid) {
    //    if (el.validity.valueMissing) { error = `The ${name} field is required (client)`; }
    //    if (el.validity.rangeUnderflow) { error = `Value is under minimum of ${this.el.nativeElement.min}`; }
    //    if (el.validity.rangeOverflow) { error = `Value is over maximum of ${this.el.nativeElement.max}`; }
    //    if (el.validity.patternMismatch) { error = `Wrong Format (${this.el.nativeElement.pattern})`; }

    //    this.renderer.setElementClass(el.parentNode, 'has-error', true);

    //    if (error) {
    //        this.addErrorBlock(el, error);
    //    }
    //}
  }

  addErrorBlock(el: any, error: string) {
    let block = this.renderer.createElement(this.outerMostParent(el), 'span');
    this.renderer.setElementClass(block, 'alert-danger', true);
    this.renderer.createText(block, error);
  }

  clearError(el: any) {
    this.renderer.setElementClass(el, 'ng-invalid', false);
    this.removeChildBlocks(el);
  }

  private removeChildBlocks(el: any) {
    try {
      // IE does NOT support forEach from childNodes
      var array = Array.from(el.childNodes);
      array.forEach((element: any) => {
        if (element && element.classList != undefined) {
          if (element.classList.contains('help-block') || element.classList.contains('alert-danger')) {
            el.removeChild(element);
          }
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  private outerMostParent(el) {
    return el.parentNode.parentNode.parentNode.parentNode
  }
}
