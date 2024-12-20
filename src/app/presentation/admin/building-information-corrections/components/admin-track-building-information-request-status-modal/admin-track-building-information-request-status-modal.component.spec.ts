/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminTrackBuildingInformationRequestStatusModalComponent } from './admin-track-building-information-request-status-modal.component';

describe('AdminTrackBuildingInformationRequestStatusModalComponent', () => {
  let component: AdminTrackBuildingInformationRequestStatusModalComponent;
  let fixture: ComponentFixture<AdminTrackBuildingInformationRequestStatusModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTrackBuildingInformationRequestStatusModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTrackBuildingInformationRequestStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
