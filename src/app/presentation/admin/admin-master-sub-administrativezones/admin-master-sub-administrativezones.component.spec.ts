import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMasterSubAdministrativezonesComponent } from './admin-master-sub-administrativezones.component';

describe('AdminMasterSubAdministrativezonesComponent', () => {
  let component: AdminMasterSubAdministrativezonesComponent;
  let fixture: ComponentFixture<AdminMasterSubAdministrativezonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMasterSubAdministrativezonesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminMasterSubAdministrativezonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
