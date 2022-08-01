import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopUpService {
  public closePopUpEvent$: Subject<Boolean> = new Subject<Boolean>();

  constructor() {}

  closePopUp(): void{
    this.closePopUpEvent$.next(true);
  }

}
