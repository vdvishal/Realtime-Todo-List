import { Component, OnInit, DoCheck, Input, ElementRef, ViewChild,AfterViewChecked } from '@angular/core';
import { Router } from '../../../node_modules/@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { SocketService } from '../socket.service';
import { EventEmitter } from 'events';
import * as _ from "lodash";
import { empty } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  host: {'(window:keydown)':'hotkeys($event)'}
})
export class HomeComponent implements OnInit,AfterViewChecked{

  // @ViewChild('scrollMe',{read:ElementRef}) private scrollMe: ElementRef;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
//   scrollToBottom(): void {
//     try {
//         this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
//     } catch(err) { }                 
// }
  public scrollToTop:Boolean=false;
  public userInfo: any = [];
  public token: string
  public onlineUsersList: any = [];
  public reqUserInfo: any = [];
  public userId: string;
  public reqInfo: any;
  public userFriends: any = [];
  public userList: any = [];
  public lists: any[];
  public name: any;
  public listData: any;
  public taskName: any;
  public id: String;
  public subTaskName: any;
  public subEvents: any[];
  public subedit: boolean = false;
  public nameUser: any;
  public undoEvent: any;
  public usId: any;

  constructor(
    public router: Router,
    public appService: AppService,
    private notify: ToastrService,
    private socketService: SocketService,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('authToken')
    this.userInfo = this.appService.getUserInfoFromLocalstorage()
    this.userId = this.userInfo.userId
    this.setUser();
    this.getUsersFriends(this.userId);
    this.onlineUsers();
    this.friendReq();
    this.friendReqNotify();
    this.notice(this.userId);
    this.getAllLists(this.userId)
    this.addEventNotify();
    this.editEventNotify();
    this.addSubEventNotify();
    this.editSubEventNotify();
    this.removeEventNotify();
    this.removeSubEventNotify();
    this.scrollToBottom();

  }
  ngAfterViewChecked() {        
    this.scrollToBottom();        
} 
scrollToBottom(): void {
  try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  } catch(err) { }                 
}
  show: boolean = false;

  public setUser = () => {
    this.socketService.setUser(this.token);
  }

  public onlineUsers = () => {
    // console.log("onlineusers called");
    this.socketService.onlineUsers()
      .subscribe(list => {
        this.onlineUsersList = list;
        // console.log("users list");
        let allOnlineusers: any = [];
        for (let i in this.onlineUsersList) {
          let obj = { "id": i, "name": this.onlineUsersList[i] }
          allOnlineusers.push(obj)
          // console.log(allOnlineusers);
        }
      })
  }

  public logout: any = () => {
    this.appService.logout();
    this.socketService.disconnect();
    this.router.navigate(['/login'])
    this.notify.success("Logged out successfully")
  }

  public friendReqNotify: any = () => {
    this.reqInfo = null;
    this.socketService.friendReqNotification(this.userId).subscribe(
      (data) => {
        this.reqInfo = data
        this.notify.info("You have a friend Request!")
        console.log(this.reqInfo);
        
      }
    )
  }

  public friendReq: any = () => {
    this.reqUserInfo = [];
    this.appService.getFriendReq(this.userId).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.reqUserInfo = response.data;

        }
        else {
          // this.notify.error(response.message);
        }
      }
    )
  }

  public reject: any = (info) => {
    this.appService.rejectReq(info).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.friendReq();
          this.friendReqNotify();
        }
        else {
          this.notify.error(response.message);

        }
      })
  }

  public getUsersFriends = (userId) => {
    this.userList = [];
    this.appService.getUserFriends(userId).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.userFriends = response.data;
          for (let i in this.userFriends) {
            let obj = { "id": i, "name": this.userFriends[i] }
            this.userList.push(obj)
          }
        }
        else if (response === 404) {
          console.log("No friends ");
        }
        else {
          this.notify.error(response.message);

        }
      }
    )
  }


  public accept: any = (info) => {
    info.localuser = this.userInfo

    this.appService.acceptReq(info).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.socketService.acceptNotify(info);
          this.getUsersFriends(info.recieverId)
          this.friendReq();
          this.friendReqNotify();
        }
        else {
         this.notify.error(response.message)
        }
      })
  }


  public notice: any = (userId) => {
    this.socketService.notice(userId).subscribe(
      data => {
        this.notify.success(`${data.firstName} has accepted your request`)
      }
    )
  }

  public listUserId:any;

  public getAllLists: any = (userId) => {
    this.lists = []
    this.nameUser = '';
    this.usId=userId

    this.appService.getAllList(userId).subscribe(
      (list: any) => {
        if (list.status === 200) {
          this.lists = list.data
          this.nameUser = this.lists[0].createdBy
        }
        else if (list.status === 404) {
          this.notify.info("No ToDo lists available")
        }
        else {
          this.notify.error(list.message)
        }

      }
    )
  }

  public showList: Boolean = true;

  public showForm = () => {
    this.showList = !this.showList
  }

  public createList = () => {
    if (!this.name) {
      this.notify.info("Name cannot be empty")
    } else {
      let data: any = {
        name: this.name,
        userId: this.userId,
        createdBy: this.userInfo.firstName
      }

      this.appService.createList(data)
        .subscribe((response: any) => {
          if (response.status === 200) {
            this.getAllLists(this.userId);
            this.showForm();
            this.name = '';
          }
          else {
            this.notify.error(response.message)
          }
        })
    }

  }

  hide:any = true;

  public viewList = (id) => {
    this.appService.viewList(id).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.listData = response.data;
          this.hide = true
        }
        else {
          this.notify.error(response.message)
        }
      }
    )
  }

  public createEvent = (list) => {
    if (!this.taskName) {
      this.notify.info("Name cannot be empty")
    } else {
      let data: any = {
        userId: list.userId,
        name: this.taskName,
        id: list.id,
        listName: list.name,
        creator: list.createdBy,
        userName: this.userInfo.firstName
      }
      this.appService.createEvent(data)
        .subscribe((response: any) => {
          if (response.status === 200) {
            this.viewList(data.id);
            this.taskName = ''
          }
          else {
            this.notify.error(response.message)
          }
        })

      this.socketService.addEvent(data)
    }
  }

  public createSubEvent = (event) => {
    if (!this.subTaskName) {
      this.notify.info("Name cannot be empty")
    } else {
      let data: any = {
        userId: this.userId,
        name: this.subTaskName,
        listId: event.parentId,
        id: event.id,
        listName: event.listName,
        createdBy: event.createdBy,
        userName: this.userInfo.firstName
      }
      this.appService.createSubEvent(data)
        .subscribe((response: any) => {
          if (response.status === 200) {
            this.getSubEvent(event.id)
            this.subTaskName = '';
            this.socketService.addSubEvent(data)
          }
          else {
            this.notify.error(response.message)
          }
        })
    }
  }

  public getSubEvent = (id) => {
    this.subEvents = [];
    this.appService.getSubEvent(id)
      .subscribe((response: any) => {
        if (response.status === 200) {
          this.subEvents = response.data
        }
        else if(response.status === 404){
          null
        }
        else {
          this.notify.error(response.message)
        }
      })
  }

  


  public deleteList = (list) => {
    this.appService.deleteList(list.id).subscribe((response: any) => {
      if (response.status === 200) {
        this.getAllLists(list.userId)
        this.hide = false;

        let undoAction = {
          actionName: 'deleteList',
          previousName: list.name,
          eventId: list.id,
          createdBy: list.createdBy,
          created: list.createdOn,
          userId: list.userId,
          events:list.events
        }
        this.appService.undoAction(undoAction).subscribe((response: any) => {
          if (response.status === 200) {
            
          }
          else {
            this.notify.error(response.message)
          }
        })
      }
      else {
        this.notify.error(response.message)
      }
    })
  }

  public deleteEvent = (event) => {
    let data = {
      id: event.parentId,
      eventId: event.id,
      listName: event.listName,
      eventName: event.name,
      userId: event.userId,
      createdBy: event.createdBy,
      userName: this.userInfo.firstName
    }
    this.appService.deleteEvent(data).subscribe(
      (result: any) => {
        if (result.status === 200) {
          this.viewList(data.id);
          this.socketService.removeEvent(data)
        }
      }
    )

    let undoAction = {
      actionName: 'deleteEvent',
      previousName: event.name,
      eventId: event.id,
      parentId: event.parentId,
      listId: event.listId,
      listName: event.listName,
      createdBy: event.createdBy,
      created: event.createdOn,
      userId: event.userId,
      isDone: event.isDone,
    }
  
    
    this.appService.undoAction(undoAction).subscribe((response: any) => {
      if (response.status === 200) {
        console.log("success");
      }
      else {
        this.notify.error(response.message)
      }
    })
  }

  public deleteSubEvent = (event) => {

    let data = {
      id: event.id,
      parentId: event.parentId,
      listId: event.listId,
      userId: event.userId,
      listName: event.listName,
      eventName: event.name,
      createdBy: event.createdBy,
      userName: this.userInfo.firstName
    }
    this.appService.deleteSubEvent(data).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.getSubEvent(data.parentId);
          this.socketService.removeSubEvent(data)
        }
        else{
          this.notify.error(response.message)
        }
      }
    )

    let undoAction = {
      actionName: 'deleteSubEvent',
      previousName: event.name,
      eventId: event.id,
      parentId: event.parentId,
      listId: event.listId,
      listName: event.listName,
      createdBy: event.createdBy,
      created: event.createdOn,
      userId: event.userId,
      isDone: event.isDone
    }

    this.appService.undoAction(undoAction).subscribe((response: any) => {
      if (response.status === 200) {
        
      }
      else {
        this.notify.error(response.message)
      }
    })
  }

  public edit: Boolean = false;
  public showedit: any;
  public editEvent = (i) => {
    this.edit = !this.edit
    this.showedit = i
  }

  public editName: String

  public editEventName = (event) => {
    if (!this.editName) {
      this.notify.info("Name cannot be empty")
    } else {
      let data = {
        previousName: event.name,
        name: this.editName,
        eventId: event.id,
        parentId: event.parentId,
        listId: event.listId,
        listName: event.listName,
        userName: this.userInfo.firstName,
        creator: event.createdBy
      }

      this.appService.editEvent(data).subscribe
        ((response: any) => {
          if (response.status === 200) {
            this.viewList(data.parentId);
            this.edit = !this.edit
            this.showedit = -1;
            this.editName = ''
            this.socketService.editEvent(data)
          }
          else {
            this.notify.error(response.message)
          }
        })

      let undoAction = {
        actionName: 'editevent',
        previousName: event.name,
        eventId: event.id,
        parentId: event.parentId,
        listId: event.listId,
        listName: event.listName,
        createdBy: event.createdBy,
        userId: event.userId,
        isDone: event.isDone,
        createdOn: event.createdOn
      }  
      this.appService.undoAction(undoAction).subscribe((response: any) => {
        if (response.status === 200) {
          
        }
        else {
          this.notify.error(response.message)
        }
      })
    }
  }


  public showsubedit: any;

  public editSubEvent = (i) => {

    this.subedit = !this.subedit
    this.showsubedit = i

  }

  public editSubName: String

  public editSubEventName = (event) => {
    if (!this.editSubName) {
      this.notify.info("Name cannot be empty")
    } else {
      let data = {
        previousName: event.name,
        name: this.editSubName,
        id: event.id,
        parentId: event.parentId,
        listId: event.listId,
        listName: event.listName,
        creator: event.createdBy,
        userName: this.userInfo.firstName
      }


      this.appService.editSubEvent(data).subscribe
        ((response: any) => {
          if (response.status === 200) {
            this.getSubEvent(data.parentId);
            this.subedit = !this.subedit
            this.showsubedit = '';
            this.editSubName = '';
            this.socketService.editSubEvent(data)
          }
          else {
            this.notify.error(response.message)
          }
        })

      let undoAction = {
        actionName: 'editSubevent',
        previousName: event.name,
        eventId: event.id,
        parentId: event.parentId,
        listId: event.listId,
        listName: event.listName,
        createdBy: event.createdBy,
        userId: event.userId,
        isDone: event.isDone
      }

      this.appService.undoAction(undoAction).subscribe((response: any) => {
        if (response.status === 200) {

        }
        else {
          this.notify.error(response.message)
        }
      })
    }
  }

  public checked: Boolean = false

  public eventCheck = (event) => {
    let data = {
      eventId: event.id,
      parentId: event.parentId,
      listId: event.listId
    }
    this.appService.checkEvent(data).subscribe
      ((response: any) => {
        if (response.status === 200) {
          
          this.viewList(data.parentId);
        }
        else {
          this.notify.error(response.message)
        }
      })
  }

  public checkSubEvent = (event) => {
    let data = {
      id: event.id,
      parentId: event.parentId,
      listId: event.listId

    }
    this.appService.checkSubEvent(data).subscribe
      ((response: any) => {
        if (response.status === 200) {
         
          this.getSubEvent(event.parentId);
        }
        else {
          this.notify.error(response.message)
        }
      })

  }

  public notification: any = [];

  public addEventNotify = () => {
    this.socketService.addEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has created a ${response.name} task in ${response.creator}'s ${response.listName} list`
        this.notification.push(text)
        if(this.listData.id === response.id){
          this.viewList(response.id)
        }
      })
  }
  public addSubEventNotify = () => {
    this.socketService.addSubEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has created a ${response.name} subtask in ${response.createdBy}'s ${response.listName} list`
        this.notification.push(text)
      })
  }

  public editEventNotify = () => {
    this.socketService.editEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has renamed the ${response.previousName} task to ${response.name} in ${response.creator}'s ${response.listName} list`
        this.notification.push(text)
        if(this.listData.id === response.id){
          this.viewList(response.id)
        }
      })
  }

  public editSubEventNotify = () => {
    this.socketService.editSubEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has renamed the ${response.previousName} subtask to ${response.name} in ${response.creator}'s ${response.listName} list`
        this.notification.push(text)
      })
  }
  public removeEventNotify = () => {
    this.socketService.deleteEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has deleted the ${response.eventName} task in ${response.createdBy}'s ${response.listName} list`
        this.notification.push(text)
                if(this.listData.id === response.id){
          this.viewList(response.id)
        }
      })
  }
  public removeSubEventNotify = () => {
    this.socketService.deleteSubEventNotify()
      .subscribe((response) => {
        let text = `${response.userName} has deleted the ${response.eventName} subtask in ${response.createdBy}'s ${response.listName} list`
        this.notification.push(text)
      })
  }

  public undo = () => {
    this.undoEvent;
    this.appService.undo(this.usId)
      .subscribe((response: any) => {
        if (response.status === 200) {
          this.undoEvent = response.data
          if (this.undoEvent.actionName === 'editSubevent' || this.undoEvent.actionName === 'deleteSubEvent') {
            this.getSubEvent(this.undoEvent.parentId);
          }
          else if (this.undoEvent.actionName === 'deleteList'){
            this.getAllLists(this.undoEvent.userId)
            this.viewList(this.undoEvent.id);
          }
          else {
            this.viewList(this.undoEvent.id);
            this.getAllLists(this.undoEvent.userId)
          }
        }
        else {
          this.notify.error(response.message)
        }
      })
  }

  hotkeys(event: KeyboardEvent){
    if ( event.ctrlKey  && event.keyCode == 90){
      this.undo();
   }
 }

}
