const SHIFT_ROLE = '/Role-Management'
const SHIFT_POST = '/PlaceWorker'

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
    })
    }

function transferShiftData(hour, hour_place, day){
    document.getElementById('hours_shift').value = hour;
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

function closePop(){
    form = document.getElementsByClassName("pop-up-visable").item(0)
    form.setAttribute('class', 'pop-up-hidden');
}

