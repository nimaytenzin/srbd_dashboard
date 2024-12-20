/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminViewCorrectionRequestPdfComponent } from './admin-view-correction-request-pdf.component';

describe('AdminViewCorrectionRequestPdfComponent', () => {
  let component: AdminViewCorrectionRequestPdfComponent;
  let fixture: ComponentFixture<AdminViewCorrectionRequestPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewCorrectionRequestPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewCorrectionRequestPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
