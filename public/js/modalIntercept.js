const SHIFT_ROLE = '/Role-Management'
const SHIFT_POST = '/PlaceWorker'
const ROLE_DELETE = '/Delete-Role'
const SHIFT_DELETE = '/DeleteShift'
const TRADE_SHIFT = '/Trade-Shift'
const SUBMIT_SHIFT_TRADE = "/Submit-Trade"
const SUBMIT_TIME_OFF = "/Submit-Time-Off"

function modalFind(name, color,id){
    form = document.getElementsByClassName("pop-up-hidden").item(0)
    form.setAttribute('class', 'pop-up-visable');
    document.getElementById('role-name').value = name;
    document.getElementById('role-color').value = color;
    document.getElementById('role-id').value = id;
}

function submitShiftRole(){
    var inputs = document.getElementsByTagName('input');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].name] = inputs[i].value;
    }
    fetch(SHIFT_ROLE,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        window.location.reload()
    })

    }

function transferShiftData(hour, hour_place, day, shift, workOrder, roleId, workerId){
    document.getElementById('hours_shift').value = hour;
    document.getElementById('Shift_Id').value = shift;
    document.getElementById('workordercount').value = workOrder;
    document.getElementById('selectrole').value = roleId;
    document.getElementById('selectname').value = workerId;
    var time = ""
    switch(hour_place){
        case("0"):
            time = "12:00 AM, "
            break;
        case("1"):
            time = "1:00 AM, "
            break;
        case("2"):
            time = "2:00 AM, "
            break;
        case("3"):
            time = "3:00 AM, "
            break;
        case('4'):
            time = "4:00 AM, "
            break;
        case('5'):
            time = "5:00 AM, "
            break;
        case('6'):
            time = "6:00 AM, "
            break;
        case('7'):
            time = "7:00 AM, "
            break;
        case('8'):
            time = "8:00 AM, "
            break;
        case('9'):
            time = "9:00 AM, "
            break;
        case('10'):
            time = "10:00 AM, "
            break;
        case('11'):
            time = "11:00 AM, "
            break;
        case('12'):
            time = "12:00 PM, "
            break;
        case('13'):
            time = "1:00 PM, "
            break;
        case('14'):
            time = "2:00 PM, "
            break;
        case('15'):
            time = "3:00 PM, "
            break;
        case('16'):
            time = "4:00 PM, "
            break;
        case('17'):
            time = "5:00 PM, "
            break;
        case('18'):
            time = "6:00 PM, "
            break;
        case('19'):
            time = "7:00 PM, "
            break;
        case('20'):
            time = "8:00 PM, "
            break;
        case('21'):
            time = "9:00 PM, "
            break;
        case('22'):
            time = "10:00 PM, "
            break;
        case('23'):
            time = "11:00 PM, "
            break;
    }
   
    time += day;
    document.getElementsByClassName('Time').item(0).textContent = time;

    form = document.getElementsByClassName("pop-up-hidden").item(0)
    if (form){
        form.setAttribute('class', 'pop-up-visable');
    }
} 
    
function submitShift(){
    var inputs = document.getElementsByClassName('Shift-Data');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].name] = inputs[i].value;
    }
    fetch(SHIFT_POST,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })

}

function deleteShift(){
    var inputs = document.getElementsByClassName('Shift-Data');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].name] = inputs[i].value;
    }
    fetch(SHIFT_DELETE,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })

}

function postInPlace(URL, parent){
    
    var inputs = parent.getElementsByTagName('input');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].name] = inputs[i].value;
    }
    fetch(URL,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })

}


function closePop(){
    form = document.getElementsByClassName("pop-up-visable").item(0)
    form.setAttribute('class', 'pop-up-hidden');
}


function deleteRole(id){
    var out = {"Id": id};

    fetch(ROLE_DELETE,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })

}


function tradeShift(worker_name, shift_id, role_name, Hour, month, year, worker_id){
    if(shift_id){
    var time = ""
    switch(Hour){
        case("0"):
            time = "12:00 AM"
            break;
        case("1"):
            time = "1:00 AM"
            break;
        case("2"):
            time = "2:00 AM"
            break;
        case("3"):
            time = "3:00 AM"
            break;
        case('4'):
            time = "4:00 AM"
            break;
        case('5'):
            time = "5:00 AM"
            break;
        case('6'):
            time = "6:00 AM"
            break;
        case('7'):
            time = "7:00 AM"
            break;
        case('8'):
            time = "8:00 AM"
            break;
        case('9'):
            time = "9:00 AM"
            break;
        case('10'):
            time = "10:00 AM"
            break;
        case('11'):
            time = "11:00 AM"
            break;
        case('12'):
            time = "12:00 PM"
            break;
        case('13'):
            time = "1:00 PM"
            break;
        case('14'):
            time = "2:00 PM"
            break;
        case('15'):
            time = "3:00 PM"
            break;
        case('16'):
            time = "4:00 PM"
            break;
        case('17'):
            time = "5:00 PM"
            break;
        case('18'):
            time = "6:00 PM"
            break;
        case('19'):
            time = "7:00 PM"
            break;
        case('20'):
            time = "8:00 PM"
            break;
        case('21'):
            time = "9:00 PM"
            break;
        case('22'):
            time = "10:00 PM"
            break;
        case('23'):
            time = "11:00 PM"
            break;
    }

    var out = {
        worker_name,
        shift_id,
        role_name,
        time,
        month,
        year,
        worker_id
    }
   
    post_to_url(TRADE_SHIFT, out)
    } 
}


function SubmitShiftTrade(){
    values = new FormData(document.getElementById("Shift_Trade"));
    out ={}
    for (var pair of values.entries()) {
         out[pair[0]]= pair[1];
      }

    post_to_url(SUBMIT_SHIFT_TRADE, out)
}


function postFormToUrl(path, form){
    values = new FormData(form);
    out ={}
    for (var pair of values.entries()) {
         out[pair[0]]= pair[1];
      }

    post_to_url(path, out)
}


function post_to_url(path, params, method) {
    method = method || "post";

    var form = document.createElement("form");

    //Move the submit function to another variable
    //so that it doesn't get overwritten.
    form._submit_function_ = form.submit;

    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);

        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form._submit_function_(); //Call the renamed function.
}

function submitTradeApproval(approval, requester_id, requestee_id, shift_1, shift_2, request_id){
    out = {
        approval, requester_id, requestee_id, shift_1, shift_2, request_id
    }

    fetch("/Trade-Shift-Approval",{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })
}


function submitTimeOff(){
    values = new FormData(document.getElementById("TimeOffRequest"));
    var out ={}
    for (var pair of values.entries()) {
         out[pair[0]]= pair[1];
      }

      post_to_url(SUBMIT_TIME_OFF, out)


}


function submitTimeOffApproval(approval, requester_id, shift_1, request_id){
    out = {
        approval, requester_id, shift_1, request_id
    }

    fetch("/Request-Off-Approval",{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })
}

function submitCover(ShiftId, RequesterUser, RequesteeUser){
 out ={
     ShiftId,
     RequesterUser,
     RequesteeUser
 }

 post_to_url("/Submit-Cover", out)
}

function submitCoverApproval(approval, requester_id, shift_1, request_id){
    out = {
        approval, requester_id, shift_1, request_id
    }

    fetch("/Cover-shift-Approval",{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    }).then((response)=>{
        location.reload()
    })
}

function offSetWeek(OffSet){
    out = {
        "OffSet": +OffSet
    }
    post_to_url("/Full-Schedule", out)

}

function offSetWeekMine(OffSet){
    out = {
        "OffSet": +OffSet
    }
    post_to_url("/My-Schedule", out)

}

function sortUsers(day, hour) {
    var selElem = document.getElementById('selectname')
    var selectedUser = selElem.value || -1;
    var tmpAry = new Array();
    var allUsers;
    fetch("/All-Users",{
        method : 'POST',
        body : "",
        headers : {
            'content-type' : 'application/json'
        }
    }).then(response=> response.json()).then(data => {
        allUsers = data;
        i = 0
        for (key in allUsers) {
            tmpAry[i] = new Array();
            tmpAry[i][0] = allUsers[key]["UserName"];
            tmpAry[i][1] = allUsers[key]["id"];
            i++;
        }
       
    //Go get avalabilty for users

    fetch("/All-User-Avalability",{
        method : 'POST',
        body : "",
        headers : {
            'content-type' : 'application/json'
        }
    }).then(response=> response.json()).then(data =>{

    var place = 0;
    var secondPlace = 0;

    let newAry = new Array();
    let notAry = new Array();
    
    let status = ["Avalable", "Not Specified", "Not Avalable", "Done"]
    
    status.forEach(stats =>{ 
       
        if(stats != "Done"){
            newAry[place] = new Array();
            newAry[place][0] = stats;
            newAry[place][1] = -1;
            place +=1;
        }

        if(stats == "Avalable"){
            tmpAry.forEach(user=>{                
                for(key in data){                   
                    if(data[key]["User"] === +user[1] && data[key]["Avalability"] === 1 && data[key]["Day"] === +day && data[key]["Hour"] === +hour){
                        newAry[place] = new Array();
                        newAry[place][0] = user[0];
                        newAry[place][1] = user[1];
                        place +=1;
                    }
                }
                
            })        
        }

        if (stats == "Not Specified"){
             tmpAry.forEach(user =>{
                for(key in data){
                    if(data[key]["User"] === +user[1] && data[key]["Avalability"] === 0 && data[key]["Day"] === +day && data[key]["Hour"] === +hour){
                        notAry[secondPlace] = new Array();
                        notAry[secondPlace][0] = user[0];
                        notAry[secondPlace][1] = user[1];
                        secondPlace +=1;
                    }
                }
            })
            tmpAry.forEach(user =>{
                var found = false
                for(key in data){
                    if(data[key]["User"] === +user[1] && data[key]["Day"] === +day && data[key]["Hour"] === +hour){
                        found = true;
                    }
                }
               
                if(!found){
                    newAry[place] = new Array();
                    newAry[place][0] = user[0];
                    newAry[place][1] = user[1];
                    place +=1;
                }
            })

        }

        if(stats == "Not Avalable"){
             notAry.forEach(user=>{
                newAry[place] = new Array();
                newAry[place][0] = user[0];
                newAry[place][1] = user[1];
                place +=1;
            })
        }

        if(stats == "Done"){
            tmpAry = newAry;
        }

    })

    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
        selElem.options[i] = op;
    }

    if(selectedUser != -1){
        selElem.value = selectedUser;
    } 
    return;

        
    })
    
    
    
        
    })



    
}