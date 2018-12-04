import { Component, OnInit } from '@angular/core';
import { Router } from '../../../node_modules/@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  phoneCode:any =[];
  code:any = [];

  public email: any;
  public password: any;

  public mail: any;
  public newpassword: any;
  public firstName: String
  public lastName:String
  public number:Number
  public ccode:Number
  constructor(
    public router: Router,
    public appService:AppService,
    private notify: ToastrService,

  ) { }

  ngOnInit() {
     
    this.appService.getPhnCode()
    .subscribe((response) => {
      this.phoneCode = response
      
      for (const key in this.phoneCode) {
        if  (this.phoneCode.hasOwnProperty(key)) {
          const element = this.phoneCode[key];
          this.code.push(element);
        }
      }  
    })
  }

  show = false;

  public token:any = () => {
    this.show = !this.show;
  }

  public login: any = () => {
    if(!this.email) {
      this.notify.warning("enter email")
    }
    else if(!this.password) {
      this.notify.warning("enter password")
    }
    else {
      let data = {
        email: this.email,
        password: this.password
      }
      this.appService.login(data)
      .subscribe((response) => {
        if (response.error.status === 400){
          this.notify.error(response.error.message)
          console.log("response");
          
        }
        else if(response.status === 200) {
            localStorage.setItem('authToken',response.data.token)
            this.appService.setUserInfoInLocalStorage(response.data.userDetails)
            this.router.navigate(['/home']);
        }
        else {
          this.notify.error(response.message)
        }
      },
      error => {
       if(error.status == 400){
        this.notify.error(error.error.message);
       }
       else {
        this.notify.error(error.error.message);
       }
   }
  )
    }
  }

  public signup:any =  () => {
    
    let data :any = {
      email: this.mail,
      password:this.newpassword,
      firstName:this.firstName,
      lastName:this.lastName,
      number:this.number,
      code:this.ccode
    }
    this.appService.signup(data)
      .subscribe((response) => {
        if(response.status === 200) {
          this.router.navigate(['/login']);
          this.notify.success("success");  
          this.token();    
  }
  else {
    this.notify.warning(response.message)
  }
})
  }

}
