import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service'
import { Order } from 'src/app/models/order';
import { Product } from 'src/app/models/product';
import { MatTableModule } from '@angular/material/table';
import { observable, Observable } from 'rxjs';
import { IOrder } from 'src/app/IOrder';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { LineaPedido } from 'src/app/models/LineaPedido';
import { temporaryAllocator } from '@angular/compiler/src/render3/view/util';
import { PedidoGlobal } from 'src/app/models/PedidoGlobal';
import { Alert } from 'selenium-webdriver';


export interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

  json : string;
  LineaPedido: LineaPedido = new LineaPedido();
  LineaPedidoActu: LineaPedido = new LineaPedido();
  miOrder : any[];
  actuFecha :PedidoGlobal = new PedidoGlobal();
  ProductToSelect : string;
  ArrayDeProductos : Product[] = [];
  Temporal : Product[] = []
  Stock:string
  SubTotal: any = 0.0;
  SubTotalEdit : any = 0.0;
  id : string
  max:string;
  select : any;
  Data : any;
  p : Product;
  miLineasDePedido : Observable<any[]>;
  miLineasDePedido2 :string
  miLineasDePedido3 : any[] = [];
  ProductsToFilter : string[] = [];
  StockTotal : any = 0;
  cantidadReservada : any = 0;
  CantidadCompare : any;
  fechaConHora : Date;

  private fechaSelecionada: Date = new Date();

  flecha: any;
  productid: number
  //public columns = ['name', 'description', 'category', 'units', 'unitPrice', 'taxes','subTotal']
  public columns = ['nombre', 'descripcion', 'listaCategorias', 'cantidad','precioUnitario','impuestos','subtotal','Acciones']



  constructor(public miOrderService: OrderService,private httpClient:HttpClient,private route: ActivatedRoute,) { }

  public ngOnInit() {
    
    this.id = this.route.snapshot.paramMap.get('id');
    this.miLineasDePedido = this.miOrderService.getInfoLineas(this.id);
    

    this.miOrderService.getInfoLineas(this.id).subscribe(result =>{
        this.miLineasDePedido2 = JSON.stringify(result)
        this.miLineasDePedido3 = JSON.parse(this.miLineasDePedido2);

    })

   

    this.miOrderService.getInfoPrductGeneral().subscribe(result =>{

      this.miOrder = result;
      this.ProductToSelect = JSON.stringify(result)
      this.Temporal = JSON.parse(this.ProductToSelect)


     })

   
      this.miOrderService.getInfoClient(this.id).subscribe(result => {
        this.Data = result;
      });


  }

  public Open(){

    this.miOrderService.getInfoLineas(this.id).subscribe(result =>{
      this.miLineasDePedido2 = JSON.stringify(result)
      this.miLineasDePedido3 = JSON.parse(this.miLineasDePedido2);

      this.ArrayDeProductos = [];

      for(var i = 0; i< this.miLineasDePedido3.length; i++){
        this.ProductsToFilter = [];
        this.ProductsToFilter.push(this.miLineasDePedido3[i].producto.nombre)
  
      }
  
      for(var i = 0; i< this.Temporal.length; i++){
  
        if(!this.ProductsToFilter.includes(this.Temporal[i].nombre)){
  
         
          this.ArrayDeProductos.push(this.Temporal[i]);
  
        }
       }

  })


     var fecha = new Date();
     fecha = this.Data.fechaEntrega
 
     let fechaNull = new Date(fecha);
     let year = fechaNull.getFullYear();
   
     if(year != 1){
 
       alert('No puedes crear pedidos si ya esta entregado')
     }else{


      document.getElementById('NewProduct').removeAttribute('hidden');

     }


  }

  public ProductoSeleccionado(id){

     this.miOrderService.getInfoPrductID(id).subscribe(r =>{

      this.json =JSON.stringify(r);

      this.p = JSON.parse(this.json);
  
      this.max = this.p.stock.toString();

      document.getElementById('descrip').setAttribute('value',this.p.descripcion.toString());
      document.getElementById('descrip').setAttribute('readonly','readonly');

      document.getElementById('categories').setAttribute('value',this.p.listaCategorias[0].nombre);
      document.getElementById('categories').setAttribute('readonly','readonly');

      document.getElementById('cantidad').setAttribute('max',this.max);

      document.getElementById('precio').setAttribute('value',this.p.precioVenta);
      

      document.getElementById('impuestos').setAttribute('value','0.21');
      document.getElementById('impuestos').setAttribute('readonly','readonly');

      document.getElementById('stockdispo').innerText = this.p.stock.toString();

     })

  
  }


  public Borrar(id){

 
    var fecha = new Date();
    fecha = this.Data.fechaEntrega

    let fechaNull = new Date(fecha);
    let year = fechaNull.getFullYear();
  
    if(year == 1){
      this.miOrderService.deleteLine(id,this.id).subscribe(result =>{
        alert('Borrado correctamente')
        this.miLineasDePedido = this.miOrderService.getInfoLineas(this.id);
      });
      //this.reloadPage();
    }else{
      alert('No puedes borrar un pedido ya entregado')
    }
  }


  public save(){

    var preciounit : number = parseFloat((<HTMLInputElement>document.getElementById("precio")).value);
    let cantidad : number = parseInt((<HTMLInputElement>document.getElementById("cantidad")).value);
   
    this.LineaPedido.idPedido = parseInt(this.id)
    this.LineaPedido.idProducto = parseInt(this.p.id);  
    this.LineaPedido.precioUnitario = preciounit;

    this.LineaPedido.cantidad = cantidad;
    this.LineaPedido.impuestos = 0.21;
    this.LineaPedido.subtotal =  this.SubTotal;


    console.log(this.LineaPedido)

    if(this.LineaPedido.cantidad > this.p.stock){

      alert('No stock suficiente')

    }if(this.LineaPedido.precioUnitario < 0){

      alert('Precio menor que 0 es de tontos vamos')
  
      }

    else{

      document.getElementById('NewProduct').setAttribute('hidden','hidden');

      console.log(JSON.stringify(this.LineaPedido))
  
      this.addProducto(this.LineaPedido)
  
    }

  }
  
  public addProducto(LineaPedido): void{
  
    var send = JSON.stringify(LineaPedido);
    let headers = new HttpHeaders().set('Content-Type','application/json');
     
     this.httpClient.post('https://flamerpennyapi.azurewebsites.net/pedido/'+this.LineaPedido.idPedido +'/lineapedido',send,{headers : headers})
     .subscribe(
       result => 
       {console.log('Todo flama'),
       this.miLineasDePedido = this.miOrderService.getInfoLineas(this.id),
       alert('Añadido correctamente')},
       error =>{console.log(error)},
       )

  }

  public Editar(id){
 

  document.getElementById('EditarPro').removeAttribute('hidden');

  this.miOrderService.getLinea(this.id,id).subscribe(result =>{

    this.json =JSON.stringify(result);

    this.LineaPedidoActu = JSON.parse(this.json);

    this.CantidadCompare = this.LineaPedidoActu.cantidad;
    
    document.getElementById('cantidadE').setAttribute('value',this.LineaPedidoActu.cantidad.toString());

    document.getElementById('precioE').setAttribute('value',this.LineaPedidoActu.precioUnitario.toString());

    document.getElementById('totalE').setAttribute('value',this.LineaPedidoActu.subtotal.toString());
    
    

  })

  this.miOrderService.getInfoPrductID(id).subscribe(r =>{

    this.productid = id;

    this.json =JSON.stringify(r);

    this.p = JSON.parse(this.json);

 
    document.getElementById('stockdispoE').innerText = this.p.stock.toString();
    

  })

  }

  public Actualizar(){

    

  document.getElementById('EditarPro').setAttribute('hidden','hidden');
  

  var preciounit : number = parseFloat((<HTMLInputElement>document.getElementById("precioE")).value);
  let cantidad : number = parseInt((<HTMLInputElement>document.getElementById("cantidadE")).value);
  

    this.LineaPedido.idPedido = parseInt(this.id)
    this.LineaPedido.idProducto = this.productid;
    this.LineaPedido.precioUnitario = preciounit;

    this.LineaPedido.cantidad = cantidad;
    this.LineaPedido.impuestos = 0.21;
    this.LineaPedido.subtotal =  this.SubTotalEdit;

    if((this.p.stock + this.CantidadCompare) - (this.LineaPedido.cantidad)  < 0 || this.LineaPedido.cantidad >(this.p.stock + this.CantidadCompare)){

      alert('Stock insuficiente');

    }if(this.LineaPedido.precioUnitario < 0){

      alert('Precio menor que 0 es de tontos vamos')

    }
     else{

    var fecha = new Date();
    fecha = this.Data.fechaEntrega

    let fechaNull = new Date(fecha);
    let year = fechaNull.getFullYear();
  
    if(year != 1){

      alert('No puedes editar pedido ya entregado')

    }else{

      this.ActualizarLinea(this.LineaPedido);

    }

     
      
}

  }
 
  public ActualizarLinea(LineaPedido): void{
  
  var send = JSON.stringify(LineaPedido);
  let headers = new HttpHeaders().set('Content-Type','application/json');
   
   this.httpClient.put('https://flamerpennyapi.azurewebsites.net/pedido/'+this.LineaPedido.idPedido +'/lineapedido',send,{headers : headers})
   .subscribe(
     result => 
     {console.log('Todo flama')
     this.miLineasDePedido = this.miOrderService.getInfoLineas(this.id) 
      alert('Actualizacion correcta')},
     error =>{console.log(error)})
  }

  public CalcularCantidad(){

  var preciounit : number = parseFloat((<HTMLInputElement>document.getElementById("precio")).value);
  var cantidad : number = parseInt((<HTMLInputElement>document.getElementById("cantidad")).value);
  var impuesto = 0.21

   this.SubTotal = preciounit * cantidad * impuesto;

  }

  public CalcularCantidadEditar(){

  var preciounit : number = parseFloat((<HTMLInputElement>document.getElementById("precioE")).value);
  let cantidad : number = parseInt((<HTMLInputElement>document.getElementById("cantidadE")).value);
  var impuesto = 0.21

  this.SubTotalEdit = (preciounit * cantidad) + (preciounit * cantidad * impuesto);


  }

  CambiarFecha(fechaEntrega){

    var fecha = new Date();
    fecha = fechaEntrega
    let fechaNull = new Date(fecha);
    let year = fechaNull.getFullYear();
  
    if(year != 1){
      alert('No puedes cambiar la fecha de un pedido ya entregado')
    }else{

      document.getElementById('fecha').removeAttribute('hidden');

    }
  }

  helow(){

    var fecha : string = (<HTMLInputElement>document.getElementById("fechaSelect")).value.toString();
    var horaSelect : string = (<HTMLInputElement>document.getElementById("horaSelect")).value.toString();
    var fechaConHora = fecha.concat('T'+horaSelect +':00')
   
    var fechaCompare = new Date(fechaConHora);
    var FechaActual = new Date();
    var FechaPedido = new Date(this.Data.fechaPedido.toString());
  
    alert(fechaConHora)
  
    this.actuFecha.fechaEntrega = fechaConHora;
    this.actuFecha.fechaPedido = this.Data.fechaPedido;
    this.actuFecha.id = this.Data.id;
    this.actuFecha.idCliente = this.Data.idCliente;
    this.actuFecha.nombreVendedor = this.Data.nombreVendedor;
    this.actuFecha.totalPedido = this.Data.totalPedido;

    console.log(this.actuFecha.fechaEntrega)

    if(fechaCompare < FechaPedido){

      alert('La fecha de entrega no puede ser menor a la de realizacion')

    }else if(fechaCompare > FechaActual){

      alert('La fecha de entrega no puede ser mayor a la actual')

    }else{

      this.ActuFecha(this.actuFecha)
      document.getElementById('fecha').setAttribute('hidden','hidden');

    }

    //var json = JSON.stringify(this.actuFecha);
  


  }

  
  public ActuFecha(fechaNueva): void{
  
    var send = JSON.stringify(fechaNueva);
    let headers = new HttpHeaders().set('Content-Type','application/json');
     
     this.httpClient.put('https://flamerpennyapi.azurewebsites.net/pedido',send,{headers : headers})
     .subscribe(
       result => 
       {
         console.log(result)
         
      this.miOrderService.getInfoClient(this.id).subscribe(result => {
        this.Data = result;
      });
      alert('Actualizada correctamente')
      });

  }

   twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

  SendDate(){

    this.fechaConHora = new Date();
    //var fechaFlama = this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());

    //this.actuFecha.fechaEntrega = this.fechaConHora;
    this.actuFecha.fechaPedido = this.Data.fechaPedido;
    this.actuFecha.id = this.Data.id;
    this.actuFecha.idCliente = this.Data.idCliente;
    this.actuFecha.nombreVendedor = this.Data.nombreVendedor;
    this.actuFecha.totalPedido = this.Data.totalPedido;

  }


}
