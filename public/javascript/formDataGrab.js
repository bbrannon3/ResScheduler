const form = document.querySelector('.Submitable');
const API_URL = "http://localhost:3000/deleteUser"
form.reset();
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Data Submitted');
        const formData= new FormData(form);
        
        var inf = {};
        var keys = formData.keys()
        var iter = keys.next()
        while(!iter.done){
            inf[iter.value] = formData.get(iter.value)
            iter = keys.next()
        }
    

       for (item in inf){
            console.log(item)
            console.log(inf[item])
        }

        fetch(API_URL,{
            method : 'POST',
            body : JSON.stringify(inf),
            headers : {
                'content-type' : 'application/json'
            }
        });

    
        form.reset();
    })