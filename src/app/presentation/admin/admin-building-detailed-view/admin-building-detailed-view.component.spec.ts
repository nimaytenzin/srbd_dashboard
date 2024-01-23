import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuildingDetailedViewComponent } from './admin-building-detailed-view.component';

describe('AdminBuildingDetailedViewComponent', () => {
  let component: AdminBuildingDetailedViewComponent;
  let fixture: ComponentFixture<AdminBuildingDetailedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBuildingDetailedViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminBuildingDetailedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
