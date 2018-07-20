import * as express from 'express';
import {Server} from "ws";

const app = express();

export class Product{
    constructor(
        public id:number,
        public name: string,
        public price:number,
        public rating:number,
        public desc:string,
        public categories: Array<string>
    ){
    }
}

export class Comment{
    constructor(
        public id: number,
        public productId: number,
        public  timestamp: string,
        public name: string,
        public rating: number,
        public comment: string
    ){}
}
const products: Product[] = [
    new Product(1,"water",3.0,3.8,"water",["geocery"]),
    new Product(2,"milk",4.99,4.5,"2% milk",["geocery","dairy product"]),
    new Product(3,"cookie",2.55,2.5,"cookie",["geocery"]),
    new Product(4,"chip",4.5,4.3,"BBQ Chip",["geocery"]),
    new Product(5,"earphone",25.99,3.6,"earphone",["device","computer "]),
    new Product(6,"ipad",320.99,4.7,"latest version",["device","computer ","Apple"]),
];
const comments: Comment[] = [
    new Comment(1,1,"2018-01-01 11:11:11","Amber",4,"very good"),
    new Comment(2,1,"2018-01-01 11:11:11","Bob",4,"very good"),
    new Comment(3,3,"2018-01-01 11:11:11","Cindy",4,"very good"),
    new Comment(4,4,"2018-01-01 11:11:11","Divid",4,"very good"),
];
app.get('/api/',(req, res)=>{
    res.send("Hello express");
});
app.get('/api/products',(req,res)=>{
    let result = products;
    let params = req.query;
    console.log(req.url);
    // if(params.name){
    //     result = result.filter((p)=> p.name.indexOf(params.name)!== -1);
    // }
    // if(params.price && result.length > 0){
    //     result = result.filter(p=> p.price <= parseInt(params.price));
    // }
    // if(params.category!=="-1" && result.length > 0){
    //     result = result.filter(p=> p.categories.indexOf(params.category)!==-1);
    // }
    res.json(result);
});
app.get('/api/product/:id',(req,res)=>{
    res.json(products.find(product=> product.id == req.params.id));
});
app.get('/api/product/:id/comments',(req,res)=>{
    res.json(comments.filter((comment:Comment) => comment.productId == req.params.id));
});
const server = app.listen(8000,"localhost",()=>{
    console.log("服务器已启动，地址：http://localhost:8000");
});
const subscription = new Map<any,number[]>();

const wsServer = new Server({port:8085});
wsServer.on("connection",websocket=>{
    websocket.send("this message from server");
    websocket.on("message", message =>{
        let messageObj = JSON.parse( message );
        let productIds = subscription.get(websocket)||[]
        subscription.set(websocket,[...productIds, messageObj.productid])
    })
});
const currentBids = new Map<number, number>();
setInterval(()=>{
    products.forEach( p =>{
        let currentBid = currentBids.get(p.id)|| p.price;
        let newBid = currentBid + Math.random()*5;
        currentBids.set(p.id, newBid);
    });
    subscription.forEach((productIds:number[], ws)=>{
        if(ws.readyState ===1){
            let newBids = productIds.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            ws.send(JSON.stringify(newBids));
        }else{
            subscription.delete(ws);
        }

    });
},3000);

