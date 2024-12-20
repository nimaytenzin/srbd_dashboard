/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminAddBuildingInformationCorrectionRequestModalComponent } from './admin-add-building-information-correction-request-modal.component';

describe('AdminAddBuildingInformationCorrectionRequestModalComponent', () => {
  let component: AdminAddBuildingInformationCorrectionRequestModalComponent;
  let fixture: ComponentFixture<AdminAddBuildingInformationCorrectionRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddBuildingInformationCorrectionRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddBuildingInformationCorrectionRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
