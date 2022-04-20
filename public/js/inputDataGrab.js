const API_URL = "/Admin-Settings"
const USER_SETTINGS = "/User-Settings"

function submitInputs(){
var inputs = document.getElementsByTagName('input');
var out = {};
for(i=0; i < inputs.length; i++){
    out[inputs[i].title] = inputs[i].value;
}
fetch(API_URL,{
    method : 'POST',
    body : JSON.stringify(out),
    headers : {
        'content-type' : 'application/json'
    }
});
}

function submitUserSettings(){
    var inputs = document.getElementsByTagName('input');
    var out = {};
    for(i=0; i < inputs.length; i++){
        out[inputs[i].title] = inputs[i].value;
    }
    fetch(USER_SETTINGS,{
        method : 'POST',
        body : JSON.stringify(out),
        headers : {
            'content-type' : 'application/json'
        }
    });
    }