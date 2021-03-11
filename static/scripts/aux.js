var uploadFile = function(ob){
    filename = ob.files[0].name;
    if (filename.lastIndexOf('.') !== -1) {
        var fileType = (filename.substring(filename.lastIndexOf(".")+1,filename.length)).toLowerCase();
        if (fileType !== 'csv'){
            alert('Only CSV file is accepted!');
            return;
        }
        var fd=new FormData();

        fd.append("file",ob.files[0]);
        fd.append('label','csv');

        var xhr=new XMLHttpRequest();
        xhr.open("POST","/save_file");
        xhr.addEventListener("load",uploadComp,false);
        xhr.send(fd)
    } else {
        alert('Only CSV file is accepted, filename suffix is missing!');
        return;
    }
}

