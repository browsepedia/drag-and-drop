import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BpDropEvent } from './drag.models';
import { DragUtils } from './drag.utils';
import { BpDropzoneDirective } from './dropzone.directive';

@Injectable()
export class BpDragService<T> {
  constructor(rendererFactory: RendererFactory2) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  private _renderer: Renderer2;

  private _data!: T | null;
  private _dropzone: Element | null = null;
  private _isDragging$ = new BehaviorSubject<boolean>(false);
  private _draggedElement: HTMLElement | null = null;
  private _mouseElementId = 'DRAG_MOUSE_POINTER_ELEMENT_ID';
  private _mouseElementOffsetX = 0;
  private _mouseElementOffsetY = 0;
  private _draggedElementOriginalRef!: HTMLElement;

  private _activeDropzoneClass = 'bp-dragging-over';

  private _dropzones: BpDropzoneDirective<T>[] = [];
  private _data$ = new BehaviorSubject<T | null>(null);

  public get activeDropzone(): Element | null {
    return this._dropzone;
  }

  public get isDragging$(): Observable<boolean> {
    return this._isDragging$.asObservable();
  }

  public get data$(): Observable<T | null> {
    return this._data$.asObservable();
  }

  public get draggedElement(): Element | null {
    return this._draggedElement;
  }

  public get draggedElementOriginalRef(): HTMLElement {
    return this._draggedElementOriginalRef;
  }

  registerDropzone(dropzone: BpDropzoneDirective<T>): void {
    this._dropzones.push(dropzone);
    this.removePlaceholderFromDOM(dropzone.element.nativeElement);
  }

  unregisterDropzone(dropzone: BpDropzoneDirective<T>): void {
    const index = this._dropzones.findIndex((e) => e === dropzone);
    this._dropzones.splice(index, 1);
  }

  getDropzoneByElement(element: Element | null): BpDropzoneDirective<T> | null {
    return (
      this._dropzones.find((e) => e.element.nativeElement === element) || null
    );
  }

  startDrag(element: Element, data: T): void {
    this._setDraggedElement(element);

    this._data = data;
    this._data$.next(data);
    this._isDragging$.next(true);
  }

  endDrag(): void {
    this.removePlaceholderFromDOM(this.activeDropzone);

    this._isDragging$.next(false);

    if (this._draggedElement) {
      document.body.removeChild(this._draggedElement);
    }

    this._draggedElement = null;
    this._data = null;
    this._data$.next(null);
    this.clearActiveDropzone();
  }

  onMouseMove(event: MouseEvent): void {
    const dropzone = DragUtils.getClosestDropzoneFromMousePosition(event);

    if (dropzone && dropzone !== this._dropzone) {
      this.removePlaceholderFromDOM(this._dropzone);
      this.setActiveDropzone(dropzone);
    } else {
      this.checkAndUpdatePlaceholderPosition(event);
    }

    event.preventDefault();
  }

  setActiveDropzone(dropzone: Element): void {
    const dropzoneRef = this.getDropzoneByElement(dropzone);

    if (dropzoneRef && dropzoneRef.disabled) {
      this._dropzone = null;
      return;
    }

    if (this._dropzone) {
      this._dropzone.classList.remove(this._activeDropzoneClass);
    }

    this._dropzone = dropzone;
    if (dropzone) {
      this._dropzone.classList.add(this._activeDropzoneClass);
    }
  }

  clearActiveDropzone(): void {
    if (this._dropzone) {
      this._dropzone.classList.remove(this._activeDropzoneClass);
    }
    this._dropzone = null;
  }

  createDropEvent(event: MouseEvent, targetIndex: number): BpDropEvent<T> {
    return {
      event: new MouseEvent(event.type, event),
      data: this._data as T,
      targetIndex,
    };
  }

  setMousePositionOffset(event: MouseEvent, element: HTMLElement): void {
    const box: DOMRect = element.getBoundingClientRect();
    const offsetX = event.pageX - box.left;
    const offsetY = event.pageY - box.top;
    this._mouseElementOffsetX = offsetX;
    this._mouseElementOffsetY = offsetY;
  }

  updateMouseElementPosition(event: MouseEvent): void {
    if (!this._draggedElement) {
      return;
    }

    requestAnimationFrame(() => {
      if (this._draggedElement) {
        this._draggedElement.style.left = `${
          event.clientX - this._mouseElementOffsetX
        }px`;
        this._draggedElement.style.top = `${
          event.clientY - this._mouseElementOffsetY
        }px`;
      }
    });
  }

  checkAndUpdatePlaceholderPosition(event: MouseEvent): void {
    const dropzoneRef = this.getDropzoneByElement(this._dropzone);

    const placeholder = dropzoneRef?.placeholderRef?.elementRef.nativeElement;

    if (dropzoneRef && dropzoneRef.disabled && placeholder) {
      this.removePlaceholderFromDOM(this._dropzone);
    }

    if (!placeholder) {
      return;
    }

    if (placeholder.parentNode !== this._dropzone) {
      this._renderer.appendChild(this._dropzone, placeholder);
    }

    const directChild = DragUtils.getDirectChildElement(
      this._dropzone,
      event.target as Element
    );

    if (directChild === null || directChild === placeholder) {
      return;
    }

    const insertPosition = DragUtils.getInsertPositionRelativeToElement(
      event,
      directChild,
      dropzoneRef.isHorizontal
    );

    if (insertPosition === 'before') {
      if (directChild.previousSibling !== placeholder) {
        this._renderer.insertBefore(this._dropzone, placeholder, directChild);
      }
    } else {
      if (directChild.nextSibling !== placeholder) {
        this._renderer.insertBefore(
          this._dropzone,
          placeholder,
          directChild.nextSibling
        );
      }
    }
  }

  removePlaceholderFromDOM(element: Element | null): void {
    const dropzoneRef = this.getDropzoneByElement(element);
    const placeholder =
      element?.querySelector('[bpDropPlaceholder]') ||
      dropzoneRef?.placeholderRef?.elementRef?.nativeElement;

    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
  }

  private _setDraggedElement(element: Element): void {
    if (this._draggedElement) {
      return;
    }

    this._draggedElementOriginalRef = element as HTMLElement;

    const mouseElement = element.cloneNode(true) as HTMLElement;
    mouseElement.style.position = 'fixed';
    mouseElement.style.pointerEvents = 'none';
    mouseElement.style.zIndex = '100';
    mouseElement.id = this._mouseElementId;
    mouseElement.style.setProperty('width', `${element.clientWidth}px`);
    const addedElement = document.body.appendChild(mouseElement);

    this._draggedElement = addedElement;
  }
}
