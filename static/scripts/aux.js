var margin = { left: 90, right: 60, top: 70, bottom: 90 };
var clusters = [];
var color = d3.scale.category20();

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

var cluster = function () { 
    $.ajax({
        type: 'POST',
        url: '/cluster',
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            clusters = res;
            numOfClusters = 9; // this is verified at the backend server
            res.forEach(function (d, i) {
                d3.selectAll('.point'+i)
                    .style('fill', color(d));
            });
            if (d3.select('#paral-coor-plot')[0][0] !== null) {
                res.forEach(function (d, i) {
                    d3.selectAll('.line'+i)
                        .style('stroke', color(d));
                });
            }
            colors = [];
            for (let i = 0; i < numOfClusters; i++) {
                colors.push(color(i));
            }
            legend = d3.selectAll('.legend');
            legend.selectAll('*').remove();
            colors.forEach(function (d, i) {
                legend.append('circle')
                    .attr('cx', -75 + i * 65)
                    .attr('cy', 7)
                    .attr('r', 3.5)
                    .attr('fill', d)
                    .attr('fill-opacity', 0.7);
                legend.append('text')
                    .attr('text-ancor', 'start')
                    .attr('x', -70 + i * 65)
                    .attr('y', 10)
                    .text('cluster' + i);
            })

        },
        error: () => { alert('Fail to cluster'); }
    });
}
