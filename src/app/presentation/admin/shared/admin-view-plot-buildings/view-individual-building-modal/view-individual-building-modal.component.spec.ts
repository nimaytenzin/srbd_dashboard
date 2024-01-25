import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIndividualBuildingModalComponent } from './view-individual-building-modal.component';

describe('ViewIndividualBuildingModalComponent', () => {
  let component: ViewIndividualBuildingModalComponent;
  let fixture: ComponentFixture<ViewIndividualBuildingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewIndividualBuildingModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewIndividualBuildingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
