import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '../../node_modules/@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://todoapi.uiwiz.xyz'
  private socket:any;

  constructor(private http:HttpClient) { 
    this.socket = io(this.url);
  }
  
  public setUser = (data) => {    
    this.socket.emit("set-user", data);
    console.log("user emitted");
  }

  public onlineUsers = () => {
    console.log("user online called");
    return Observable.create((observer) => {
      this.socket.on('online-user-list',list => {
        console.log(list);
        observer.next(list)
      })
    })
  }

  public addUser = (userInfo) => {
    console.log("adduser");
    this.socket.emit('add-user',userInfo)
  }

  public friendReqNotification = (userId) => { 
    return Observable.create((observer) => {
      this.socket.on(userId,data =>{
        observer.next(data);
      }); 
    });
  }

  public acceptNotify = (info) => {
    this.socket.emit('accept-notify',info)
  }

  public notice = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(`${userId}__`,data =>{
        observer.next(data);
      }); 
    });
  }

  public disconnect = () => {
    this.socket.disconnect()
  }


  public addEvent = (data) => {
    this.socket.emit('add-event-notify',data);
  }
  public addSubEvent = (data) => {
    this.socket.emit('add-subevent-notify',data);
  }
  public editEvent = (data) => {
    this.socket.emit('edit-event-notify',data);    
  }
  public editSubEvent = (data) => {
    this.socket.emit('edit-subevent-notify',data);
  }
  public removeEvent = (data) => {
    this.socket.emit('delete-event-notify',data);
  }
  public removeSubEvent = (data) => {
    this.socket.emit('delete-subevent-notify',data);
  }

  public addEventNotify = () => { 
    return Observable.create((observer) => {
      this.socket.on("create-event",data =>{
        observer.next(data);
      }); 
    });
  }

  public editEventNotify = () => {
    return Observable.create((observer) => {
      this.socket.on("edit-event",data =>{
        observer.next(data);
      }); 
    });
  }

  public addSubEventNotify = () => {
    return Observable.create((observer) => {
      this.socket.on("add-sub-event",data =>{
        observer.next(data);
      }); 
    });
  }

  public editSubEventNotify = () => {
    return Observable.create((observer) => {
      this.socket.on("edit-sub-event",data =>{
        observer.next(data);
      }); 
    });
  }

  public deleteEventNotify = () => {
    return Observable.create((observer) => {
      this.socket.on("delete-event",data =>{
        observer.next(data);
      }); 
    });
  }

  public deleteSubEventNotify = () => {
    return Observable.create((observer) => {
      this.socket.on("delete-sub-event",data =>{
        observer.next(data);
      }); 
    });
  }




}
