import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMasterBuildingComponent } from './admin-master-building.component';

describe('AdminMasterBuildingComponent', () => {
  let component: AdminMasterBuildingComponent;
  let fixture: ComponentFixture<AdminMasterBuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMasterBuildingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminMasterBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
