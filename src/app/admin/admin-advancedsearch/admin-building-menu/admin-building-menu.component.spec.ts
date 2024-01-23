import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBuildingMenuComponent } from './admin-building-menu.component';

describe('AdminBuildingMenuComponent', () => {
  let component: AdminBuildingMenuComponent;
  let fixture: ComponentFixture<AdminBuildingMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBuildingMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminBuildingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
