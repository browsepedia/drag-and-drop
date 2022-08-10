import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DropzoneComponent } from './dropzone/dropzone.component';
import { BpDragDropModule } from 'projects/drag-and-drop/src/lib';

@NgModule({
  declarations: [AppComponent, DropzoneComponent],
  imports: [BrowserModule, BpDragDropModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
