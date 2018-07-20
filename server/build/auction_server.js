"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var ws_1 = require("ws");
var app = express();
var Product = /** @class */ (function () {
    function Product(id, name, price, rating, desc, categories) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, name, rating, comment) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.name = name;
        this.rating = rating;
        this.comment = comment;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, "water", 3.0, 3.8, "water", ["geocery"]),
    new Product(2, "milk", 4.99, 4.5, "2% milk", ["geocery", "dairy product"]),
    new Product(3, "cookie", 2.55, 2.5, "cookie", ["geocery"]),
    new Product(4, "chip", 4.5, 4.3, "BBQ Chip", ["geocery"]),
    new Product(5, "earphone", 25.99, 3.6, "earphone", ["device", "computer "]),
    new Product(6, "ipad", 320.99, 4.7, "latest version", ["device", "computer ", "Apple"]),
];
var comments = [
    new Comment(1, 1, "2018-01-01 11:11:11", "Amber", 4, "very good"),
    new Comment(2, 1, "2018-01-01 11:11:11", "Bob", 4, "very good"),
    new Comment(3, 3, "2018-01-01 11:11:11", "Cindy", 4, "very good"),
    new Comment(4, 4, "2018-01-01 11:11:11", "Divid", 4, "very good"),
];
app.get('/api/', function (req, res) {
    res.send("Hello express");
});
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
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
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("服务器已启动，地址：http://localhost:8000");
});
var subscription = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (websocket) {
    websocket.send("this message from server");
    websocket.on("message", function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscription.get(websocket) || [];
        subscription.set(websocket, productIds.concat([messageObj.productid]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscription.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscription.delete(ws);
        }
    });
}, 3000);
//# sourceMappingURL=auction_server.js.map