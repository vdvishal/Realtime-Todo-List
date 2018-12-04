import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { HttpErrorResponse, HttpParams,HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  public phoneUrl = "http://country.io/phone.json"
  public baseUrl = "http://todoapi.uiwiz.xyz/api/v1"

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/x-www-form-urlencoded',
    })
  };

  constructor(private http:HttpClient) { }

  public setUserInfoInLocalStorage = (data) =>{
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public login(data): Observable<any> {
    const params = new HttpParams()
    .set('email', data.email)
    .set('password', data.password);
    return this.http.post(`${this.baseUrl}/users/login`,params)
  }

  public signup(data): Observable<any> {
    const params = new HttpParams()
    .set('email', data.email)
    .set('password', data.password)
    .set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('mobileNumber',data.number)

    return this.http.post(`${this.baseUrl}/users/signup`,params)

  }

  public logout():any {
    localStorage.removeItem('authToken');
 }

 public forgotpassword(data):any {
  return this.http.post(`${this.baseUrl}/users/resetpassword`,data)
}

public resetpassword(param,data):any {
  return this.http.post(this.baseUrl + '/users/resetpassword/' + param.tokeninfo,data)
}

public allusers():any {
  return this.http.get(this.baseUrl+'/users/get/allusers')
}

public getPhnCode(){
  let myResponse = this.http.get(`${this.phoneUrl}`);
  return myResponse;
}

public getFriendReq = (userId) => {
    return this.http.get(this.baseUrl+'/users/get/req/'+userId)
}

public rejectReq = (info) => {
  return this.http.post(`${this.baseUrl}/users/reject/${info.senderId}`,info)
}

public acceptReq = (info) => {
  return this.http.post(`${this.baseUrl}/users/accept/${info.senderId}`,info)
}

public getUserFriends = (userId) => {
  return this.http.get(`${this.baseUrl}/users/friends/${userId}`,userId)
}

public getAllList = (userId) => {
  return this.http.get(`${this.baseUrl}/events/lists/${userId}`)
}

public createList = (info) => {
  return this.http.post(`${this.baseUrl}/events/createlist`,info)
}

public viewList = (id) => {
  return this.http.get(`${this.baseUrl}/events/list/${id}`)
}

public createEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/createlist/addevent/${data.id}`,data)
}

public createSubEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/addevent/subevent/${data.id}`,data)
}

public getSubEvent = (id) => {
  return this.http.get(`${this.baseUrl}/events/subevent/${id}`)
}

public deleteList = (id) => {
  return this.http.post(`${this.baseUrl}/events/deletelist/${id}`,this.httpOptions)
}

public deleteEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/delete/event/${data.id}`,data)
}

public deleteSubEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/delete/subevent/${data.id}`,data)
}

public editEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/edit/event/${data.parentId}`,data)
}

public editSubEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/edit/subevent/${data.id}`,data)
}

public checkEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/check/event/${data.parentId}`,data)
}

public checkSubEvent = (data) => {
  return this.http.post(`${this.baseUrl}/events/check/subevent/${data.id}`,data)
}

public undoAction = (data) => {
  return this.http.post(`${this.baseUrl}/events/undo/${data.userId}`,data)
}

public undo = (userId) => {
  return this.http.post(`${this.baseUrl}/events/undodb/${userId}`,userId)
}

}

