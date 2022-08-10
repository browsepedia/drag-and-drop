import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  combineLatest,
  defer,
  fromEvent,
  Observable,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { BpDragService } from './drag.service';

@Directive({
  selector: '[bpDrag]',
})
export class BpDragDirective<T> implements AfterViewInit, OnDestroy {
  constructor(
    private readonly _element: ElementRef,
    private readonly _ngZone: NgZone,
    private readonly _service: BpDragService<T>
  ) {}

  @Input('bpDrag') public data!: T;
  @Input('bpDragDisabled') public disabled: boolean = false;

  @Output('bpDragStart') public dragStart = new EventEmitter<MouseEvent>();
  @Output('bpDragEnd') public dragEnd = new EventEmitter<void>();

  private _drag$!: Subscription;

  ngAfterViewInit(): void {
    let mousemove$: Observable<MouseEvent>;
    let mouseUpInElement$: Observable<MouseEvent>;
    let mouseup$: Observable<MouseEvent>;
    let mouseleave$: Observable<MouseEvent>;
    let mousedown$!: Observable<MouseEvent>;

    this._ngZone.runOutsideAngular(() => {
      const element: HTMLElement = this._element.nativeElement;
      element.setAttribute('draggable', 'false');

      const mouseupevent$ = defer(() =>
        fromEvent<MouseEvent>(document, 'mouseup')
      );

      mouseup$ = combineLatest([mouseupevent$, this._service.isDragging$]).pipe(
        filter(([_, isDragging]) => isDragging),
        map(([event, _]) => event),
        tap((event: MouseEvent) => {
          const originalDraggedElementRef =
            this._service.draggedElementOriginalRef;
          const dropzone = this._service.getDropzoneByElement(
            this._service.activeDropzone
          );

          if (dropzone && !dropzone.disabled) {
            const targetIndex = this._getPlaceholderIndex(
              this._service.activeDropzone
            );

            if (typeof targetIndex === 'number') {
              const dropEvent = this._service.createDropEvent(
                event,
                targetIndex
              );
              dropzone.itemDrop.emit(dropEvent);
            }
          }

          this._service.endDrag();

          setTimeout(() => {
            if (originalDraggedElementRef) {
              originalDraggedElementRef.dispatchEvent(new Event('bpDragEnd'));
            }
          }, 0);
        })
      );

      mouseUpInElement$ = defer(() =>
        fromEvent<MouseEvent>(element, 'mouseup', { passive: false })
      );

      mouseleave$ = defer(() =>
        fromEvent<MouseEvent>(element, 'mouseleave')
      ).pipe(
        takeUntil(mouseUpInElement$),
        take(1),
        tap((event: MouseEvent) => this._startDrag(event))
      );

      mousemove$ = defer(() =>
        fromEvent<MouseEvent>(document, 'mousemove')
      ).pipe(
        filter((event: MouseEvent) => !event.defaultPrevented),
        tap((event: MouseEvent) =>
          this._service.updateMouseElementPosition(event)
        ),
        debounceTime(10),
        tap((event: MouseEvent) => this._service.onMouseMove(event)),
        takeUntil(mouseup$)
      );

      mousedown$ = defer(() =>
        fromEvent<MouseEvent>(element, 'mousedown', { passive: false })
      ).pipe(
        filter(
          (event: MouseEvent) => event.button === 0 && !event.defaultPrevented
        ),
        tap((event: MouseEvent) => {
          try {
            event.preventDefault();
          } catch (e) {
            console.error(e);
          }
        })
      );
    });

    this._drag$ = mousedown$
      .pipe(
        filter(() => !this.disabled),
        tap((event: MouseEvent) =>
          this._service.setMousePositionOffset(
            event,
            this._element.nativeElement
          )
        ),
        switchMap(() => mouseleave$),
        switchMap(() => mousemove$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._drag$?.unsubscribe();
  }

  private _startDrag(event: MouseEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    this._service.startDrag(this._element.nativeElement, this.data);

    this.dragStart.emit(event);
    try {
      event.preventDefault();
    } catch (e) {
      console.error(e);
    }
  }

  private _getPlaceholderIndex(dropzone: Element | null): number | void {
    if (!dropzone) {
      return;
    }
    const placeholder = dropzone.querySelector('[bpDropPlaceholder]');

    if (placeholder) {
      return Array.prototype.indexOf.call(dropzone.children, placeholder);
    }
  }
}
