/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PublicUploadBuildingCorrectionRequestModalComponent } from './public-upload-building-correction-request-modal.component';

describe('PublicUploadBuildingCorrectionRequestModalComponent', () => {
  let component: PublicUploadBuildingCorrectionRequestModalComponent;
  let fixture: ComponentFixture<PublicUploadBuildingCorrectionRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicUploadBuildingCorrectionRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicUploadBuildingCorrectionRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
