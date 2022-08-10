export interface BpDropEvent<T> {
  event: MouseEvent;
  data: T;
  targetIndex: number;
}
