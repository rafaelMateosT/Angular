import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOrder } from '../IOrder';



@Injectable({
  providedIn: 'root'
})
export class OrderService {

  apiURLv: string = 'https://flamerpennyapi.azurewebsites.net/pedido/';
 apiURLv2: string = 'https://flamerpennyapi.azurewebsites.net/pedido/';


  constructor(private http: HttpClient) { }

  public getInfoClient(id) : Observable<any>{
    let headers = new HttpHeaders().set('Accept','application/json');
    return this.http.get<any>(this.apiURLv2+ id,{headers : headers});
  }

  public getInfoPrduct() : Observable<any[]>{
    let headers = new HttpHeaders().set('Accept','application/json');
    return this.http.get<any>(this.apiURLv,{headers : headers});
  }


  public getInfoLineas(id) : Observable<any[]>{
    let headers = new HttpHeaders().set('Accept','application/json');
    return this.http.get<any>(this.apiURLv2+ id + '/lineaPedido',{headers : headers});
  }

  public deleteOrder(id) : Observable<any>{
    
     return this.http.delete(this.apiURLv + id);
  }

  
  
}