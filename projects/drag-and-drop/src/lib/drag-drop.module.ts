import { NgModule } from '@angular/core';
import {
  BpDropzoneDirective,
  BpDropPlaceholderDirective,
} from './dropzone.directive';
import { BpDragService } from './drag.service';
import { BpDragDirective } from './drag.directive';

@NgModule({
  declarations: [
    BpDropPlaceholderDirective,
    BpDragDirective,
    BpDropPlaceholderDirective,
    BpDropzoneDirective,
  ],
  exports: [BpDropzoneDirective, BpDragDirective, BpDropPlaceholderDirective],
  providers: [BpDragService],
})
export class BpDragDropModule {}
