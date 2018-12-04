import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RouteGuard } from './route.guard';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AppService } from './app.service';
import { HttpClientModule } from '../../node_modules/@angular/common/http';
import { CommonModule } from '../../node_modules/@angular/common';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatExpansionModule} from '@angular/material/expansion';





import { SocketService } from './socket.service';
import { SearchComponent } from './search/search.component';
import { SearchPipe } from './filter/search.pipe';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    HomeComponent,
    ForgotPasswordComponent,
    SearchComponent,
    SearchPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    [MatButtonModule, MatCheckboxModule,MatDividerModule,MatSidenavModule,MatListModule,MatToolbarModule,MatExpansionModule,MatCheckboxModule],
    RouterModule.forRoot([
      {path:'login',component:LandingPageComponent,canActivate:[RouteGuard]},
      {path: '', redirectTo: 'login', pathMatch: 'full' },
      {path:'home',component:HomeComponent},
      {path:'search',component:SearchComponent},
      {path:'forgotpassword',component:ForgotPasswordComponent}
    ])
  ],
  providers: [AppService,SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
