const SHIFT_ROLE = '/Role-Management'
const SHIFT_POST = '/PlaceWorker'
const ROLE_DELETE = '/Delete-Role'
const SHIFT_DELETE = '/DeleteShift'
const TRADE_SHIFT = '/Trade-Shift'

function modalFind(name, color,id){
    form = document.getElementsByClassName("pop-up-hidden").item(0)
    form.setAttribute('class', 'pop-up-visable');
    document.getElementById('role-name').value = name;
    document.getElementById('role-color').value = color;
    console.log(id)
    document.getElementById('role-id').value = id;
}

function submitShiftRole(){
    var inputs = document.getElementsByTagName('input');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].name] = inputs[i].value;
    }
    console.log(out)
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

function transferShiftData(hour, hour_place, day, shift){
    document.getElementById('hours_shift').value = hour;
    document.getElementById('Shift_Id').value = shift;
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
    console.log(time)
    time += day;
    document.getElementsByClassName('Time').item(0).textContent = time;

    form = document.getElementsByClassName("pop-up-hidden").item(0)
    form.setAttribute('class', 'pop-up-visable');
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


function tradeShift(worker_name, shift_id, role_name, Hour, month, year){
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
        year
    }
   
    post_to_url(TRADE_SHIFT, out)
    } 
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
