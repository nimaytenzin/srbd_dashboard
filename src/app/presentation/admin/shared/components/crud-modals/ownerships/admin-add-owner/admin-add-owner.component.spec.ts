import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddOwnerComponent } from './admin-add-owner.component';

describe('AdminAddOwnerComponent', () => {
  let component: AdminAddOwnerComponent;
  let fixture: ComponentFixture<AdminAddOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAddOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAddOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
