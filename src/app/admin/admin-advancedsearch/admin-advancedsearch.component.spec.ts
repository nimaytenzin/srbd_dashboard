import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAdvancedsearchComponent } from './admin-advancedsearch.component';

describe('AdminAdvancedsearchComponent', () => {
  let component: AdminAdvancedsearchComponent;
  let fixture: ComponentFixture<AdminAdvancedsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAdvancedsearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAdvancedsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
