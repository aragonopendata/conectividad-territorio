import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainentryComponent } from './mainentry.component';

describe('MainentryComponent', () => {
  let component: MainentryComponent;
  let fixture: ComponentFixture<MainentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainentryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
