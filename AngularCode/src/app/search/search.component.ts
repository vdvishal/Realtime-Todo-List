import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { AppService } from '../app.service';
import { Router } from '../../../node_modules/@angular/router';
import { SearchPipe} from './../filter/search.pipe'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public searchText:any;
  public allusers:any = [];
  public onlineUsersList: any;
  public userinfo: any  = [];

  constructor(
    public router: Router,
    public appService:AppService,
    private notify: ToastrService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.appService.allusers().subscribe(
      (data) => {
        this.allusers = data.data  
      }
    )
    this.userinfo = this.appService.getUserInfoFromLocalstorage()
    this.onlineUsers();

  }
  public onlineUsers = () => {
    this.socketService.onlineUsers()
    .subscribe(list => {
      this.onlineUsersList = list;
    })
  }
  
  showAll:boolean = false;
  
  public getAllUsers = () => {
    this.showAll = true
  }

  public sendReq = (userId) => {
    this.userinfo.recieverId = userId
    this.userinfo.senderId = this.userinfo.userId
    this.notify.info("Request sent");
    this.appService.getUserFriends(this.userinfo.senderId).subscribe(
      (response:any) => {
        if(response.status === 200 ) {
          let userList: any  = [];
          let userCheck: any  = [];
          let userFriends: any  = [];
          userFriends = response.data;
          for (let i in userFriends) {
            let obj = {"id" : i}
            userList.push(obj)
          }
          for (let i of userList) {
           userCheck.push(i.id)
            }
          if(userCheck.includes(userId)) {
            this.notify.info("user already added")
          }
          else {
            this.socketService.addUser(this.userinfo);
          }
        }
        else {
          this.socketService.addUser(this.userinfo);
        }   
  })
 }

 public logout:any = () => {
  this.appService.logout();
  this.socketService.disconnect();
  this.router.navigate(['/login'])
  this.notify.success("Logged out successfully")
}
}