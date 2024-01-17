import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/dataservice/auth.data.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        RouterModule,
        ToastModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    providers: [MessageService],
})
export class LoginComponent implements OnInit {
    valCheck: string[] = ['remember'];

    password!: string;
    username!: string;
    remember: boolean = true;

    token!: string;

    constructor(
        private authDataService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {}
    ngOnInit(): void {
        this.token = this.authDataService.getToken();

        if (this.token) {
            setTimeout(() => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Checking for saved User Credentials',
                });
            }, 0);
            setTimeout(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Credentials saved for this session',
                });
            }, 1000);
            setTimeout(() => {
                this.router.navigate(['/admin']);
            }, 2000);
        }
    }

    login() {
        this.authDataService
            .Login({
                cid: this.username,
                password: this.password,
            })
            .subscribe({
                next: (res: any) => {
                    console.log(res);
                    if (res.statusCode === 200) {
                        this.navigate();
                        this.authDataService.setToken(res.token);
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Welcome to Zhichar.bt',
                            detail: 'sucessfully logged in',
                        });
                    }
                },
                error: (error) => {
                    console.log(error);
                },
            });
    }

    navigate() {
        this.router.navigate(['/admin']);
    }
}
