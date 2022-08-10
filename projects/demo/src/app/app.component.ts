import { Component } from '@angular/core';
import {
  getDraggingItemData,
  getIsDragging,
} from 'projects/drag-and-drop/src/lib';
import { ContainerModel } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected emptyContainer: ContainerModel = {
    children: [],
    title: 'Empty Container',
  };

  protected containers: ContainerModel[] = [];

  protected draggingItem$ = getDraggingItemData();
  protected isDragging$ = getIsDragging();

  protected onContainerDropped(): void {
    this.containers = [
      ...this.containers,
      {
        children: [],
        title: `Container ${this.containers.length + 1}`,
      },
    ];
  }
}
