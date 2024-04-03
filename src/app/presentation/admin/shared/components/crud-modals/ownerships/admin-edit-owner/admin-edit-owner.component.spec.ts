import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditOwnerComponent } from './admin-edit-owner.component';

describe('AdminEditOwnerComponent', () => {
  let component: AdminEditOwnerComponent;
  let fixture: ComponentFixture<AdminEditOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminEditOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
