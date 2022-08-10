### @browsepedia/drag-and-drop

An npm package which contains Drag and Drop functionality and supports nested dropzones.

### Demo

You can find a demo on stackblitz [here](https://stackblitz.com/edit/browsepedia-drag-and-drop-demo).
You can also clone the repository and run `ng serve demo`

#### Installation

`npm install --save @browsepedia/drag-and-drop`

#### Usage

First off, you need to import the `BpDragModule`, preferably into your `SharedModule`.

Then, you have to use the provided directives to achieve drag the drag and drop functionality you want.
There are 3 directives inside `BpDragModule`

1. `[bpDrag]="dragData"` - defines that an element is draggable, it requires that you pass data to it - it is generic typed <T>.
2. `bpDropzone` - defines that an element is a dropzone.
3. `bpDropPlaceholder` - defines that an element is the drop placeholder for a dropzone. MUST be a child of an element with the `bpDropzone` directive on it.

#### Simple example

```html
<div class="draggable-item" [bpDrag]="data">Drag me</div>

<div class"dropzone" bpDropzone (bpDropped)="onItemDropped($event)">
    <div bpDropPlaceholder class="draggable-item"></div>
</div>
```

The good think about this library compared to the @angular/material drag and drop module is that it supports nested dropzones out of the box without collision due to mouse events propagation.

#### Nested dropzones example

```html
<div class="draggable-item" [bpDrag]="data">Drag me</div>

<div class"dropzone" bpDropzone (bpDropped)="onItemDropped($event)">
   <div bpDropPlaceholder class="draggable-item"></div>

   <div class"dropzone" bpDropzone (bpDropped)="onItemDropped($event)">
       <div bpDropPlaceholder class="draggable-item"></div>
   </div>

   <div class"dropzone" bpDropzone (bpDropped)="onItemDropped($event)">
       <div bpDropPlaceholder class="draggable-item"></div>
   </div>
</div>
```

#### Properties

##### `[bpDrag]` directive

| Attribute                                         | Description                                                                                                                                                          |  Default   | Required |
| ------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: | :------: |
| `@Input() bpDrag: T`                              | This is also the directive name, but it requires an `T` value which is the object that will be emmited in the `(bpDrop)` @Output of the `bpDropzone` directive       | `undefned` |   yes    |
| `@Input() bpDragDisabled: boolean`                | Wheather the item dragging is disabled                                                                                                                               |  `false`   |    no    |
| `@Input() bpDropEffect: BpDropEffect`             | Metadata to be attached to the `(bpDrop)` @Output() of `bpDropzone` when dropping an item. You can use it to differentiate between copy or move, for example.        |  `'move'`  |    no    |
| `@Output() bpDragStart: EventEmitter<MouseEvent>` | Called when the item on which the `bpDrag` directive started t be dragged. Emmits the default JavaScript `MouseEvent`                                                |    n/a     |    no    |
| `@Output() bpDragEnd: EventEmitter<void>`         | Called when the item on which the `bpDrag` directive stopped being dragged, either by being dropped or the mouse button being raised over a non `bpDropzone` Element |    n/a     |    no    |

##### `[bpDropzone]` directive

| Attribute                                        | Description                                                                                                                                                                                   | Default | Required |
| ------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :------: |
| `@Input() bpDropDisabled: boolean `              | Wheather the dropping of items is allowed inside this container, this way you can conditionally allow or dissallow drops                                                                      | `false` |    no    |
| `@Input() bpDropzoneIsHorizontal: boolean `      | Wheather the dropzone is horizontal or not. You still have to use the correct layouting (flex-row, or grid columns), this just tells the directive how to position the placeholder correctly. | `false` |    no    |
| `@Output() bpDrop: EventEmitter<BpDropEvent<T>>` | Where T is the type of the value you set on `[bpDrag]`                                                                                                                                        |   n/a   |   yes    |

##### `[bpDropPlaceholder]`

This directive has no inputs or outputs, it is mandatory you have one inside every `[bpDropzone]`. The element on which it is set will be used as a placeholder to show where the item you dragged will be placed.

> Note that this library doesn't handle actually moving the element, that is business logic you have to take care of using the library. For example, when catching a `(bpDrop)` event you have to move the item where you need it.

##### The `BpDropEvent<T>` properties

```ts
interface BpDropEvent<T> {
  event: MouseEvent;
  data: T;
  targetIndex: number;
  dropEffect: BpDropEffect;
}
```

#### Getting the drag data

There are 2 ways to get the dragging state information. One for Angular 14+ and one fr Angular <14.

##### Angular 14

In Angular 14, we can now use the `inject()` function during the `constructor` phase. This opens up A LOT of posibilities. `@browsepedia/drag-and-drop` uses the `inject()` function and exposes 2 methods that depend on it in order to avoid the direct dependency on `BpDragService`.

1. `getIsDragging()` which returns an `Observable<boolean>` that indicates weather an element is being dragged.
2. `getDraggingItemData()` which returns an `Observable<T>` where T is the data type of the value passed to the `[bpDrag]` directive on the element that is being dragged.

Using the above functions you can declare members in your components directly, without needing the constructor.
Example

```ts
    import { getIsDragging, getDraggingItemData } from '@browsepedia/drag-and-drop';

    @Component({...})
    export class MyComponent {
        protected isDragging$ = getIsDragging();
        protected draggedItemData = getDraggingItemData();
    }
```

#### Angular <13

For Angular version less that 14 you have to use the classic way of injecting `BpDragService` and accessing the 2 public properties.

1. `service.isDragging$`, which is an `Observable<boolean>` that indicates weather an element is being dragged.
2. `service.data$` which is an `Observable<T>` where T is the data type of the value passed to the `[bpDrag]` directive on the element that is being dragged.

#### State classes

There are a few state classes that are automatically set on the `[bpDropzone]` element, depending on the state of the dragging mechanism.

1. `.bp-dragging-over` is set on the container which you are currently dragging over and in which the placeholder is visible.
2. `.bp-dragging-active` is set on all dropzones which are not disabled when an element is being dragged.
