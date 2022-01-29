const form = document.querySelector('.Submitable');
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

        console.log(inf)
        for (item in inf){
            console.log(item)
            console.log(inf[item])
        }

    
        form.reset();
    })