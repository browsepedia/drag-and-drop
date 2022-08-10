import { Component, Input } from '@angular/core';
import { BpDropEvent } from 'projects/drag-and-drop/src/lib';
import { ContainerModel } from '../models';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
})
export class DropzoneComponent {
  @Input() public container!: ContainerModel;

  protected onSectionDrop(event: BpDropEvent<ContainerModel>): void {
    this.container.children = [
      ...this.container.children,
      {
        ...event.data,
        children: [...event.data.children],
      },
    ];
  }
}
