export class DragUtils {
  public static getDirectChildElement = (
    container: Element | null,
    descendant: Element
  ): Element | null => {
    let child: Node = descendant;

    while (child.parentNode !== container) {
      if (!child.parentNode) {
        return null;
      }

      child = child.parentNode;
    }

    return child as Element;
  };

  public static getInsertPositionRelativeToElement = (
    event: MouseEvent,
    element: Element,
    horizontal: boolean
  ): 'before' | 'after' => {
    const bounds = element.getBoundingClientRect();

    if (horizontal) {
      return event.clientX < bounds.left + bounds.width / 2
        ? 'before'
        : 'after';
    }
    return event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after';
  };

  public static getClosestDropzoneFromMousePosition = (
    event: MouseEvent
  ): Element | void => {
    const dropzone = document.elementFromPoint(event.clientX, event.clientY);
    if (dropzone && dropzone.hasAttribute('bpDropzone')) {
      return dropzone;
    } else {
      if (dropzone) {
        return dropzone.closest('[bpDropzone]') as Element;
      }
    }
  };
}
