var express = require('express');
var bodyParser = require('body-parser');
// var cors = require('cors')

var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://mss:mss@ds159180.mlab.com:59180/interfacedb';
var url = 'mongodb://mss:mss123@ds151450.mlab.com:51450/interface_medical_db';

var app = express();

var session = require('express-session');
app.use(session({
  secret: 'ssshhhhh'
}));

var port = process.env.PORT || 7000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var sess;

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public' + '/index.html');
});

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.error('Unable to connect to the mongoDB server. Error:', err);
  } else {


    //console.log(db);

    // Get the documents collection
    var collection0 = db.collection('dealer');
    var collection = db.collection('customer');
    var collection1 = db.collection('order');
    var collection2 = db.collection('orderdItems');
    var collection4 = db.collection('claims');
    var invoiceCollection = db.collection('invoiceDetails');
    var claims_ref_codes = db.collection('claims_ref_codes');
    var _categoryCollection = db.collection('category');
    var _productsCollection = db.collection('products');


    //*=======================================Authenticate Customer============================================*//


    app.get('/user/login', function (req, res) {
      //console.log(req.body);
      sess = req.session;
      var Email = req.query.Email;
      var Password = req.query.Password;
      collection0.find({
        "Email": Email,
        "Password": Password
      }).toArray(function (err, result) {
        sess.result = result
        //console.log("session data"+JSON.stringify(sess.result[0].type));
        if (sess.result) {
          response = {
            "output": sess.result
          }
          res.json(response)
          //console.log(JSON.stringify(response));
        } else {
          error = {
            "output": err
          }
          console.error(error)
          res.json(error);
        }
      });
    });


    //*--------------------------claims data--------------------------------------------------*//

    app.get('/claims', function (req, res) {
      // console.log("entered in claims");

      collection4.aggregate([{
        $lookup: {
          from: "claims_ref_codes",
          localField: "CaseStatus",
          foreignField: "Code",
          as: "case_status_ref"
        }
      }], function (err, result) {
        //sess.result=result
        //console.log("session data"+JSON.stringify(sess.result[0].type));
        if (err) {
          response = {
            "output": err
          }
          res.json(response)
          //console.log(JSON.stringify(response));
        } else {
          response = {
            "output": result
          }
          // console.log(response);
          res.json(response);
        }
      });
    });
    ///*--------------------------------------------------------------------------*//
    app.get('/claims/claim', function (req, res) {
      // console.log("entered in claim details");
      var id = req.query.orderId;
      // console.log("entered in claim details" + id);
      collection4.aggregate([{
        $lookup: {
          from: "claims_ref_codes",
          localField: "CaseStatus",
          foreignField: "Code",
          as: "case_status_ref"
        }
      },
      {
        $match: {
          orderId: id
        }
      }], function (err, result) {
        //sess.result=result
        //console.log("session data"+JSON.stringify(sess.result[0].type));
        if (err) {
          response = {
            "output": err
          }
          res.json(response)
          //console.log(JSON.stringify(response));
        } else {
          response = {
            "output": result
          }
          // console.log(response);
          res.json(response);
        }
      });


    });


    //*====================================Store CustomerData In DB======================================*//

    app.post('/user', function (req, res) {
      // console.log('hi');
      // Prepare output in JSON form at
      var customerName = req.body.customerName
      var customerId = req.body.customerId
      var cEmail = req.body.cEmail
      var cPassword = req.body.cPassword
      var cConfirmPass = req.body.cConfirmPass
      var customerPhone = req.body.customerPhone
      var customerRole = req.body.customerRole
      var markertType = req.body.markertType
      var ProjectName = req.body.ProjectName
      var country = req.body.country
      var state = req.body.state
      var address = req.body.address
      var PostalCode = req.body.PostalCode


      // console.log(customerName +""+ customerId +""+ cEmail);
      collection.insert({
        "customerName": customerName,
        "customerId": customerId,
        "cEmail": cEmail,
        "cPassword": cPassword,
        "customerPhone": customerPhone,
        "customerRole": customerRole,
        "markertType": markertType,
        "ProjectName": ProjectName,
        "country": country,
        "state": state,
        "address": address,
        "PostalCode": PostalCode
      }, function (err, result) {
        if (err) {
          response = {
            "output": error
          }
          res.json(response);
        } else {
          response = {
            "output": result
          }
          //console.log("customerData"+JSON.stringify(response));
          res.json(response);
        }

      })

    })

    //*==================================Post Order Data==========================================*/


    //insert Orderapi
    app.post('/orders/order', function (req, res) {

      // Prepare output in JSON form at
      var orderId = req.body.orderId
      var customerId = req.body.customerId
      var orderType = req.body.orderType
      var orderDate = req.body.orderDate
      var PoNumber = req.body.PoNumber
      var projectName = req.body.projectName
      var status = req.body.status

      //console.log(customerId +""+ orderType +""+ projectName);
      collection1.insert({
        "orderId": orderId,
        "customerId": customerId,
        "orderType": orderType,
        "orderDate": orderDate,
        "PoNumber": PoNumber,
        "projectName": projectName,
        "status": status
      }, function (err, result) {
        if (err) {
          response = {
            "output": error
          }
          res.json(response);
        } else {
          response = {
            "output": result
          }
          //console.log("customerData"+JSON.stringify(response));
          res.json(response);
        }

      })

    })


    //*====================================retrive Order Details ==========================================*//

    app.get('/orders', function (req, res) {
      // Prepare output in JSON form at
      //console.log(req.body);
      //console.log("session data"+JSON.stringify(sess.result[0].customerId));
      var dealerId = req.query.dealerId
      /* var orderType = req.body.orderType
      var fDate = req.body.fDate
      var tdate = req.body.tDate */

      //console.log("dealer ID from view"+dealerId)
      collection1.find({
        dealerId: dealerId
      })

      collection1.aggregate([{
        $lookup: {
          from: "invoiceDetails",
          localField: "invoiceNo",
          foreignField: "invoiceNo",
          as: "order_response"
        }
      },
      {
        $match: {
          dealerId: dealerId
        }
      }
      ], function (err, result) {

        if (err) {
          response = {
            "output": "error"
          }
          res.send(response);
          //console.log(JSON.stringify(response));
        } else {

          response = {

            "output": result

          }
          // console.log(JSON.stringify(response));
          res.send(response);

        }

      });

    });


    app.get('/invoices/invoice', function (req, res) {
      //console.log("req",req);
      var invoiceNo = req.query.invoiceNo;
      var response = {};
      invoiceCollection.aggregate([{
        $lookup: {
          from: "order",
          localField: "invoiceNo",
          foreignField: "invoiceNo",
          as: "order"
        }
      },
      {
        $unwind: "$order"
      },
      {
        $lookup: {
          from: "dealer",
          localField: "order.dealerId",
          foreignField: "dealerId",
          as: "dealerDetails"
        }
      },
      {
        $unwind: "$dealerDetails"
      },
      {
        $match: {
          'invoiceNo': invoiceNo
        }

      }

      ], function (err, result) {
        response = {
          invoiceData: result
        };
        collection2.aggregate([{
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "productId",
            as: "product_response"
          }

        }, {
          $match: {
            'orderId': result[0].order.orderId
          }
        }],
          function (err, result) {

            if (err) {
              response = {
                "output": err.message
              }
              res.send(response);
            } else {
              response.product_response = result;
              response = {

                "output": response

              }
              //console.log(response);
              res.send(response);

            }

          });

      });
    });


    //*=======================retrive Order Details with Products==========================================*//

    app.get('/products', function (req, res) {

      var orderId = req.query.orderId

      // console.log(orderId)

      collection2.aggregate([{
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "productId",
          as: "product_response"
        }
      },
      {
        $match: {
          orderId: orderId
        }
      }
      ], function (err, result) {

        if (result) {
          response = {

            "output": result

          }

          res.json(response);
          //console.log(JSON.stringify(response));
        } else {
          response = {
            "output": "error"
          }
          res.json(response);
        }

      });



      /* collection2.find({ "orderID":orderID }).toArray(function(err,result)
           {
             if(err)
              {
                response={
		            "output":error
		             }
                res.json(response);
                
              }
             else
              {
                response={
		            "output":result
		             }
                res.json(response);
                console.log(JSON.stringify(response));
              }
           });  
		   */
    });

    app.get('/orders/orderId', function (req, res) {
      var orderId = req.query.orderId;
      orderId = orderId ? orderId : "";
      sess = req.session;

      collection1.find({ 'orderId': orderId }).toArray(function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': 'No Order found with Order Num' + orderId };
          else {
            response = { 'output': ' Order Num ' + orderId + " is Valid Order" };
          }
        }
        res.send(response);
      });

    });

    app.get('/orders/order', function (req, res) {
      var orderId = req.query.orderId;
      orderId = orderId ? orderId : "";

      sess = req.session;

      collection1.find({ 'orderId': orderId }).toArray(function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': 'No Order found with Order Num' + orderId ? orderId : "" };
          else {
            response = { 'output': result };
          }
        }
        res.send(response);
      });
    });

    app.get('/orders/order/invoices', function (req, res) {

      var orderId = req.query.orderId;
      orderId = orderId ? orderId : "";

      sess = req.session;

      invoiceCollection.aggregate([{
        $lookup: {
          from: "order",
          localField: "invoiceNo",
          foreignField: "invoiceNo",
          as: "order"
        }
      },
      {
        $unwind: "$order"
      },
      {
        $match: {
          'order.orderId': orderId
        }

      }

      ], function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': 'No Invoice found with order Num' + orderId };
          else {
            response = { 'output': result };
          }
        }
        res.send(response);
      });

    });

    app.get('/orders/order/claims', function (req, res) {
      var orderId = req.query.orderId;
      sess = req.session;

      collection4.find({ 'orderId': orderId }).toArray(function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': 'No Invoice found with Invoice Num' + invoiceNo ? invoiceNo : "" };
          else {
            response = { 'output': result };
          }
        }
        res.send(response);
      });
    });

    app.get('/user/phone', function (req, res) {
      var phoneNo = req.query.phoneNo;
      sess = req.session;

      collection0.find({ 'phone': phoneNo }).toArray(function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': "Phone Number does not exist - " + phoneNo };
          else {
            response = { 'output': 'Phone Number is valid - ' + phoneNo };
          }
        }
        res.send(response);
      });
    });

    app.get('/claims/code', function (req, res) {
      var code = parseInt(req.query.code);
      sess = req.session;

      claims_ref_codes.find({ 'Code': code }).toArray(function (err, result) {
        var response;
        if (err) {
          response = { 'error': 'Error' + err };
        } else {
          if (result.length === 0)
            response = { 'output': { 'Error': "Invalid Code - " + code } };
          else {
            response = { 'output': { 'Description': result[0].Description } };
          }
        }
        res.send(response);
      });
    });


    app.get('/logout', function (req, res) {
      req.session.destroy(function (err) {
        if (err) {
          console.error(err);
        } else {
          res.redirect('/index');
          //res.render('index.html');

        }
      });

    });

    // Get List of all categories
    app.get('/get/categories', function (req, res) {

      _categoryCollection.find({}).toArray(function (err, docs) {

        if (err) {
          console.error('ERR: Failed to fetch all categories', err);
          res.send({
            output: [],
            error: 'ERR: Failed to fetch all categories' + err
          });
          return;
        }

        res.send({
          output: docs
        });

      });

    });

    // Get List of items by category id or product id
    app.get('/get/items', function (req, res) {

      let categoryId = req.query.categoryid || null;
      let productId = req.query.productid || null;
      let condition = {};

      if (categoryId) {
        condition = {
          categoryId: categoryId
        }
      } else if (productId) {
        condition = {
          productId: productId
        }
      } else {
        res.send({
          output: [],
          error: 'ERR: Missing category id or product id'
        });

        return;
      }

      _productsCollection.find(condition).toArray(function (err, docs) {

        if (err) {
          console.error('ERR: Failed to fetch items based on condition', condition, ' ---- ', err);
          res.send({
            output: [],
            error: 'ERR: Failed to fetch items based on condition ' + condition + ' ---- ' + err
          });
          return;
        }

        res.send({
          output: docs
        });

      });

    });

    // Add Products to DB
    app.post('/insert/product', function (req, res) {

      let body = req.body;

      if (body && body.categoryId && body.productId && body.unitPrice && body.currency && body.productName) {
        _productsCollection.insert({
          "productId": body.productId,
          "SKU": body.sku || '',
          "productName": body.productName,
          "unitPrice": body.unitPrice,
          "productSize": body.productSize || '',
          "productBrand": body.productBrand || '',
          "currency": body.currency,
          "description": body.description || '',
          "categoryId": body.categoryId,
          "warning": body.warning || '',
          "directions": body.directions || '',
          "strength": body.strength || '',
          "dosage": body.dosage || ''
        }, function (err, result) {
          if (err) {
            res.send({
              output: '',
              error: 'ERR: Failed to insert the payload to products collections' + err
            });
          } else {
            res.send({
              output: result
            });
          }
        });
      } else {
        res.send({
          output: '',
          error: 'ERR: JSON body is missing'
        });
      }



    })

  }
});

module.exports = app

app.listen(port, function () {
  console.log("app listening on : " + port)
})
