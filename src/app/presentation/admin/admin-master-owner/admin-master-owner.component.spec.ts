import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMasterOwnerComponent } from './admin-master-owner.component';

describe('AdminMasterOwnerComponent', () => {
  let component: AdminMasterOwnerComponent;
  let fixture: ComponentFixture<AdminMasterOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMasterOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminMasterOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
