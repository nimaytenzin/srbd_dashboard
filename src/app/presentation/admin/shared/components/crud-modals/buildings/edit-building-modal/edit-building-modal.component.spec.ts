import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBuildingModalComponent } from './edit-building-modal.component';

describe('EditBuildingModalComponent', () => {
  let component: EditBuildingModalComponent;
  let fixture: ComponentFixture<EditBuildingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBuildingModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBuildingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
