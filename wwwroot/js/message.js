"use strict";

let groupName = "PrivateGroup";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/messages", 
    // {
    //     accessTokenFactory: () => "testing"
    // }
    ).build();

connection.on("ReceiveMessage", function (message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var div = document.createElement("div");
    div.innerHTML = msg + "<hr/>";
    document.getElementById("messages").appendChild(div);
});

connection.on("UserConnected", function (connectionId) {
    var groupElement = document.getElementById("group");
    var option = document.createElement("option");
    option.text = connectionId;
    option.value = connectionId;
    groupElement.add(option);
});

connection.on("UserDisconnected", function (connectionId) {
    var groupElement = document.getElementById("group");
    for (let i = 0; i < groupElement.length; i++) {
        if (groupElement.options[i].value === connectionId) {
            groupElement.remove(i);
        }
    }
});

connection.start().catch(errorHandling());


document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("message").value;

    var groupElement = document.getElementById("group");
    var groupValue = groupElement.options[groupElement.selectedIndex].value;

    
    if (groupValue == "All" || groupValue === "Myself") {
        var method = groupValue === "All" ? "SendMessageToAll" : "SendMessageToCaller";
        connection.invoke(method, message).catch(errorHandling());
    } else if (groupValue === groupName) {
        connection.invoke("SendMessageToGroup", groupName, message).catch(errorHandling());
    } else {
        connection.invoke("SendMessageToUser", groupValue, message).catch(errorHandling());
    }

    event.preventDefault();
});

document.getElementById("joinGroup").addEventListener("click", function (event) {
    connection.invoke("JoinGroup", "PrivateGroup").catch(errorHandling());
    event.preventDefault();
});


function errorHandling() {
    return function(err) {
        return console.error("Logging...:" + err.toString());
    };
}
