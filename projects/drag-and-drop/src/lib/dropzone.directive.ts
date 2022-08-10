import {
  AfterViewInit,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  RendererFactory2,
} from '@angular/core';
import { BehaviorSubject, Subscription, tap } from 'rxjs';
import { BpDropEvent } from './drag.models';
import { BpDragService } from './drag.service';

@Directive({
  selector: '[bpDropPlaceholder]',
})
export class BpDropPlaceholderDirective {
  constructor(public readonly elementRef: ElementRef) {}
}

@Directive({
  selector: '[bpDropzone]',
})
export class BpDropzoneDirective<T> implements AfterViewInit, OnDestroy {
  constructor(
    public element: ElementRef,
    private readonly _service: BpDragService<T>,
    rendererFactory: RendererFactory2
  ) {
    const renderer = rendererFactory.createRenderer(null, null);

    this._isDragging$ = this._service.isDragging$
      .pipe(
        tap((isDragging) => {
          if (isDragging && !this.disabled) {
            renderer.addClass(this.element.nativeElement, 'bp-dragging-active');
          } else {
            renderer.removeClass(
              this.element.nativeElement,
              'bp-dragging-active'
            );
          }
        })
      )
      .subscribe();
  }

  @Input('bpDropzoneIsHorizontal') public isHorizontal = false;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('bpDropDisabled') public set disabled(_disabled: boolean) {
    this._disabled$.next(!!_disabled);
    this._disabled = _disabled;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  @Input() public readonly listItemSelector: string = '';

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('bpDrop') public itemDrop = new EventEmitter<BpDropEvent<T>>();

  @ContentChild(BpDropPlaceholderDirective)
  public readonly placeholderRef?: BpDropPlaceholderDirective;

  private _disabled$ = new BehaviorSubject<boolean>(false);
  private _isDragging$: Subscription;
  private _disabled = false;

  ngAfterViewInit(): void {
    this._service.registerDropzone(this);
  }

  ngOnDestroy(): void {
    this._service.unregisterDropzone(this.element.nativeElement);
    this._isDragging$ && this._isDragging$.unsubscribe();
  }
}
