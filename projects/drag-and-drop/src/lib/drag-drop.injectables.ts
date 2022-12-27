import { inject, VERSION } from '@angular/core';
import { Observable } from 'rxjs';
import { BpDragService } from './drag.service';

export const getIsDragging = (): Observable<boolean> => {
  const version = parseInt(VERSION.major);
  if (version < 14) {
    throw new Error(
      `You cannot use the @inject() function on Angular versions < 13. 
      Inject BpDragService in your component and use service.isDragging$`
    );
  }

  return inject(BpDragService).isDragging$;
};

export const getDraggingItemData = <T>(): Observable<T> => {
  const version = parseInt(VERSION.major);
  if (version < 14) {
    throw new Error(
      `You cannot use the @inject() function on Angular versions < 13. 
      Inject BpDragService in your component and use service.data$`
    );
  }

  return inject(BpDragService).data$;
};
