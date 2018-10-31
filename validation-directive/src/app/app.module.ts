import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ValidatorModule } from './validator/validator.module';
import { FormsModule, ReactiveFormsModule } from '../../node_modules/@angular/forms';
import { CommonModule } from '../../node_modules/@angular/common';


@NgModule({
  declarations: [
    AppComponent
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
