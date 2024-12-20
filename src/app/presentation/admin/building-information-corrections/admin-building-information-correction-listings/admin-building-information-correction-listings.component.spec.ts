/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminBuildingInformationCorrectionListingsComponent } from './admin-building-information-correction-listings.component';

describe('AdminBuildingInformationCorrectionListingsComponent', () => {
  let component: AdminBuildingInformationCorrectionListingsComponent;
  let fixture: ComponentFixture<AdminBuildingInformationCorrectionListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminBuildingInformationCorrectionListingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBuildingInformationCorrectionListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
