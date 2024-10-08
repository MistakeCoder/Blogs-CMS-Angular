import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { AppStorage } from 'src/libs/storage';
import { Router } from '@angular/router';
import { catchError, of, take } from 'rxjs';
import { Loading } from 'src/libs/loading';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {
  loading: Loading = new Loading();
  form!: FormGroup;
  value: string = '';
  storage: AppStorage = new AppStorage();

  constructor(
    private fb: FormBuilder,
    public loginService: LoginService,
    private router: Router,
  ) {
    this.initForm();
  }

  async ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.autoLogin();
  }

  /**
   * Khởi tạo form
   */
  initForm() {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  /**
   * Login
   */
  async login() {
    this.loading.setLoading(true);
    const data = this.form.value;
    await this.loginService.login(data).then(async res => {
      this.storage.setItem('access_token', res.accessToken);
      await this.loginService.fetchUser().subscribe(res => {
        this.storage.setItem('user', JSON.stringify(res.data));
      });
      this.loginService.onLogged(true);
      this.navigate('/dashboard');
      this.loading.setLoading(false);
    }).catch(error => {
      throw error;
    });
  }

  /**
   * Tự động login
   */
  async autoLogin() {
    this.loading.setLoading(true);
    const access_token = this.storage.getItem('access_token');
    if (access_token) {
      this.loginService.fetchUser().subscribe(res => {
        if (res) {
          this.loginService.onLogged(true);
          this.storage.setItem('user', JSON.stringify(res.data));
          this.navigate('/dashboard');
        }
      })
    }
    this.loading.setLoading(false);
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }
}
