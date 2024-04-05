import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { AppModule } from 'src/app/app.module';
import { BuildingOwnershipTypes } from 'src/app/core/constants';
import { OwnerDto } from 'src/app/core/models/ownership/owner.dto';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';

@Component({
  selector: 'app-admin-edit-owner',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    MessagesModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-edit-owner.component.html',
  styleUrl: './admin-edit-owner.component.scss'
})
export class AdminEditOwnerComponent implements OnInit {
  instance: DynamicDialogComponent | undefined;
  buildingId: number;
  myForm: FormGroup;
  ownerData: any;

  constructor(
    public ref: DynamicDialogRef,
    private dialogService: DialogService,
    private ownershipDataService: OwnershipDataService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.instance = this.dialogService.getInstance(this.ref);
    if (this.instance && this.instance.data) {
      this.ownerData = this.instance.data;
      console.log("lksdjflk", this.ownerData.owner.cid)
    }
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      cid: ['', Validators.required],
      name: ['', Validators.required],
      contact: [null]
    });
    this.myForm.patchValue({
      cid: this.ownerData.owner.cid,
      name: this.ownerData.owner.name,
      contact: this.ownerData.owner.contact,
    });
  }


  updateOwner() {
    this.ownershipDataService
      .updateOwnerDetail(this.ownerData.owner.id, this.myForm.value)
      .subscribe((res) => {
        if (res) {
          this.ref.close({
            added: true,
          });
        }
      });
  }
}
