function directPayCheckout(payObject, callback) {

    var merchantId = payObject.merchantId;
    var checkoutBtnElement = payObject.checkoutBtn;
    var qrCodeElement = payObject.qrCode;
    var amount = payObject.amount;
    var invoiceId = payObject.invoiceId;

    //create directPay button
    var checkoutBtnDiv = document.getElementById(checkoutBtnElement);
    //checkoutBtnDiv.innerHTML += '<button class="btn btn-primary btn-block" id="_directPayCheckoutButton">DirectPay</button>';

    //include mqtt.js
    var imported = document.createElement('script');
    imported.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js';
    document.head.appendChild(imported);

    //directpay button click
    //document.getElementById("_directPayCheckoutButton").addEventListener("click", function () {

        //document.getElementById("_directPayCheckoutButton").disabled = true;

        //assign url amount
        var _amount = amount;
        var _merchantId = merchantId;
        //assign reference number
        var referenceNo = '123456';
        var directpayUrlPayemnt = 'https://gateway.directpay.lk/default/web/purchase/getqr?amount='+_amount+'&id='+invoiceId+'&merchantId='+_merchantId;

        //create qr
        document.getElementById(qrCodeElement).innerHTML +=
                    '<img src="" id="qr" >'+
                    '<div id="success"></div>'+
                    '<div id="transactionId"></div>'+
                    '<div id="amount"></div>'+
                    '<div id="merchantName"></div>';

        //get qr
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //document.getElementById("qr").innerHTML = (xmlHttp.responseText)
                document.getElementById("qr").src = ( xmlHttp.responseText);
                // $('#_directPayCheckoutButton').remove();

            }
        };
        xmlHttp.open("GET",directpayUrlPayemnt , true); // true for asynchronous
        xmlHttp.send(null);

        // Create a client instance
       window.onload=function(){
           client = new Paho.MQTT.Client('gateway.directpay.lk/mqtt/',443, "clientId"+ new Date().getTime());
           // set callback handlers
           var options = {
               //invocationContext: {host : https://gateway.directpay.lk, port: port, path: client.path, clientId: clientId},
               // timeout: timeout,
               // keepAliveInterval:keepAlive,
               // cleanSession: cleanSession,
               useSSL: true,
               onSuccess: onConnect
               //onFailure: onFail
           };
           client.onConnectionLost = onConnectionLost;
           client.onMessageArrived = onMessageArrived;

           // connect the client
           client.connect(options);

           // called when the client connects
           function onConnect() {
               // Once a connection has been made, make a subscription and send a message.
               console.log("onConnect");
               var topic = "{{ merchantId }}";
               client.subscribe("Supun");
           }

           // called when the client loses its connection
           function onConnectionLost(responseObject) {
               if (responseObject.errorCode !== 0) {
                   console.log("onConnectionLost:"+responseObject.errorMessage);
               }
           }

           // called when a message arrives
           function onMessageArrived(message) {

               var msg = JSON.parse( message.payloadString);

               //console.log(msg);
               if(msg['success'] == true){

                   //console.log(msg);
                   //console.log("onMessageArrived:"+message.payloadString);

                   $('#transactionId').text("Receipt No: "+msg['id']);
                   $('#amount').text("Payment : "+msg['amount']);
                   $('#merchantName').text("Merchant Name: "+msg['name']);
                   $('#qr').remove();

                   callback(msg, 200);

                   document.getElementById("_directPayCheckoutButton").disabled = false;
               }else {
                   callback(msg, 500);
               }
           }
       };

    //});

}


