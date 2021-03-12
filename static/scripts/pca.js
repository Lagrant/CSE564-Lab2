var intrDimIdx = -1;
var attrs = [{'attr': ''}];
var clusters = [];

var uploadComp = function(evt){
    token = evt.target.responseText;
    console.log(token);
    $.ajax({
        type: 'POST',
        url: '/pca',
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            eigenvalues = res['eigenvalues'];
            coors = res['coors'];
            axes = res['axes'];
            
            screePlot(eigenvalues, axes);
            biplot(coors, axes);
        },
        error: () => { alert('Fail to do pca!'); }
    });
}

function screePlot(data, axes) {
    var scree = d3.select('#scree-plot');
    var width = parseInt(scree.style('width')) - margin.top - margin.bottom;
    var height = parseInt(scree.style('height')) - margin.left - margin.right;
    // var x = d3.scale.linear()
    // .domain([0, data.length+1])
    // .range([0, width]);
    var x = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeRoundBands([0, width], 0.02);

    var y = d3.scale.linear()
        .domain([0, 1.00])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var svg = scree.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    var bar = svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
        .attr('class', 'evs')
        .attr('transform', function (d, i) { return 'translate(' + x(i) + ',' + y(d) + ')'; });

    bar.append('rect')
        .attr('class', 'bar')
        .attr('x', 1)
        .attr('width', x.rangeBand())
        .attr('height', function (d) { return height - y(d); })
        .attr('fill', 'steelblue')
        .on('click', function(d, i) {
            intrDimIdx = i;
            var handle = LoadingTable(axes);
            handle.done(scatterPlotMatrix);
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('fill', 'red');
            
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('fill', 'steelblue');
            
        });
    
    /*
    bar.append('circle')
        .attr('class', 'linecircle')
        // .attr('color', 'green')
        .attr('cx', 1 + x.rangeBand() / 2)
        .attr('cy', 0)
        .attr('r', 3.5)
        .style('fill', 'black')
        .on('click', function(d, i) {
            intrDimIdx = i;
            console.log(intrDimIdx);
        })
        .on('mouseover', function() {
            d3.select(this)
                .attr('fill', 'red');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('fill', 'black');
        });
    */
    var line = d3.svg.line()
        .x(function(d, i) {
            return x(i) + x.rangeBand()/2;
        })
        .y(function(d) {
            return y(d);
        })
        .interpolate('linear');
    
    var cum = 0.0;
    var cumData = data.map(function(d) {
        cum += d;
        return cum;
    });
    svg.append('path')
        .attr('class', 'line')
        .attr('d', line(cumData))
        .attr('stroke-width', '1px')
        .attr('stroke',  'black')
        .attr('fill','none');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2 - 20)
        .attr('y', height + 35)
        .text('PCs');

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(yAxis)
        .selectAll('text')
        .text(function(d) {
            return parseFloat(d) * 100;
        });
    
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width + ',0)')
        .call(d3.svg.axis()
            .scale(y)
            .orient('right'))
        .selectAll('text')
        .text(function(d) {
            return parseFloat(d) * 100;
        });

    svg.append('text')
        .attr('x', -200)
        .attr('y', -40)
        .text('Explained Variance %')
        .attr('transform', 'rotate(270)')
        .style('text-anchor', 'center');

    svg.append('text')
        .attr('x', -240)
        .attr('y', width+50)
        .text('Cumulated Explained Variance %')
        .attr('transform', 'rotate(270)')
        .style('text-anchor', 'center');
    
    svg.append('text')
        .attr('x', 170)
        .attr('y', -20)
        .text('Scree plot for PCA')
        .style('text-anchor', 'center');
}

function biplot(data, axes) {
    var bi = d3.select('#bi-plot');
    var width = parseInt(bi.style('width')) - margin.top - margin.bottom;
    var height = parseInt(bi.style('height')) - margin.left - margin.right;

    var x = d3.scale.linear()
        .domain(d3.extent(data, (d) => { return d[0]; }))
        .range([0,width]);
    var y = d3.scale.linear()
        .domain(d3.extent(data, (d) => { return d[1]; }))
        .range([height, 0]);
    var x2 = d3.scale.linear()
        .domain(d3.extent(axes, (d) => { return d[0]; }))
        .range([0,width]);
    var y2 = d3.scale.linear()
        .domain(d3.extent(axes, (d) => { return d[1]; }))
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');
    var xAxis2 = d3.svg.axis()
        .scale(x2)
        .orient('top');
    var yAxis2 = d3.svg.axis()
        .scale(y2)
        .orient('right');

    var svg = bi.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => { return x(d[0]); })
        .attr('cy', (d) => { return y(d[1]); })
        .attr('r', 3)
        .attr('class', (_, i) => { return 'point'+i; })
        .attr('fill', 'steelblue')
        .attr('fill-opacity', 0.7);

    var line = d3.svg.line()
        .x(function(d) {
            return x2(d[0]);
        })
        .y(function(d) {
            return y2(d[1]);
        })
        .interpolate('linear');
    svg.selectAll('path')
        .data(axes).enter()
        .append('g')
        .append('path')
        .attr('class', 'gline')
        .attr('d', function(d) { return line([d, [0,0]]);} )
        .attr('stroke-width', '1px')
        .attr('stroke',  'black')
        .attr('fill','none');

    $.ajax({
        type: 'POST',
        url: '/retrieve_attrs',
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            var attrs = res['attrs'];
            svg.selectAll('.attr-name')
                .data(axes).enter()
                .append('text')
                .attr('class', '.attr-name')
                .attr('text-anchor', 'end')
                .attr('x', (d) => { return x2(d[0]); })
                .attr('y', (d) => { return y2(d[1]); })
                .text((_, i) => { return attrs[i]; });
        },
        error: () => { alert('Fail to retrieve attributes'); }
    });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .style('text-anchor', 'start');
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    svg.append('g')
        .attr('class', 'x axis')
        .call(xAxis2)
        .style('text-anchor', 'start');
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width +', 0)')
        .call(yAxis2);
    
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .text('DataX');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', -150)
        .attr('y', -40)
        .attr('transform', 'rotate(270)')
        .text('DataY');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2)
        .attr('y', -30)
        .text('AxisX');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', -150)
        .attr('y', 500)
        .attr('transform', 'rotate(270)')
        .text('AxisY');
    
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2 - 30)
        .attr('y', -50)
        .text('Biplot for PCA');

    legend = svg.append('g')
        .attr('transform', 'translate(0,' + (height + 50) + ')')
        .attr('width', width)
        .attr('class','legend');
    legend.append('circle')
        .attr('cx', 5)
        .attr('cy', 7)
        .attr('r', 3.5)
        .attr('fill', 'steelblue');
    legend.append('text')
        .attr('text-ancor', 'start')
        .attr('x', 15)
        .attr('y', 10)
        .text('pokemon');
}

function LoadingTable() {
    return $.ajax({
        type: 'POST',
        url: '/retrieve_attrs',
        // data: intrDimIdx,
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            axes = res['axes'];
            axes = axes.filter(function (_, i) {
                return i <= intrDimIdx;
            });
            loadings = new Array(res['attrs'].length);
            loadings.fill(0);
            axes.forEach(function (d) {
                d.forEach((e, i) => {
                    loadings[i] += e * e;
                });
            });
            objLoadings = []
            loadings.forEach((d, i) => {
                objLoadings.push({'index': i, 'value': d});
            });
            objLoadings.sort((a, b) => { return b['value'] - a['value'];});
            objLoadings.length = 4;

            pcLoadings = [];
            axes.forEach(function (d, i) {
                pcLoading = ['PC' + i];
                objLoadings.forEach(function (e) {
                    pcLoading.push(d[e['index']].toFixed(2));
                });
                pcLoadings.push(pcLoading);
            });
            attrs = [{'attr': ''}];
            objLoadings.forEach(function (d) {
                attrs.push({'attr': res['attrs'][d['index']], 'index': d['index']});
            });

            d3.selectAll('.table').remove();
            tb = d3.select('.menu')
                .append('table')
                .attr('class', 'table');
            tb.append('tr')
                .selectAll('.name')
                .data(attrs).enter()
                .append('th')
                .text((d) => { return d['attr'];});
            pcLoadings.forEach(function (d) {
                tb.append('tr')
                    .selectAll('.pc')
                    .data(d).enter()
                    .append('td')
                    .text((e) => { return e; })
            });
        },
        error: () => { alert('fail to retrieve attributes'); }
    });
}

function scatterPlotMatrix() {
    var scatter = d3.select('#scatter-plot-matrix');
    var width = parseInt(scatter.style('width')) - margin.top - margin.bottom;
    var height = parseInt(scatter.style('height')) - margin.left - margin.right;
    var padding = 10;
    var size = 150;
    var cols = [];
    attrs.forEach((d) => {cols.push(d['attr'])});

    d3.select('#scatter').remove();
    svg = scatter.append('svg')
        .attr('id', 'scatter')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);
    var y = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(6)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(6)
        .orient('left');
    
    _attrs = Object.assign([], attrs)
    _attrs.shift();
    $.ajax({
        type: 'POST',
        url: '/retrieve_scatter_coors',
        data: JSON.stringify(_attrs),
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            var keys = d3.keys(res);
            var data = d3.values(res);
            var points = []
            data[0].forEach(function (_, i) {
                var point = {}
                keys.forEach(function (d, j) {
                    point[d] = data[j][i];
                });
                points.push(point);
            });

            svg.selectAll('.x.axis')
                .data(data)
                .enter().append('g')
                .attr('class', 'x axis')
                .attr('transform', function(_, i) { return 'translate(' + i * size + ',' + (height + 20) + ')'; })
                .each(function(d) { 
                    x.domain(d3.extent(d)); 
                    d3.select(this)
                        .call(xAxis);
                });
            svg.selectAll('.y.axis')
                .data(data)
                .enter().append('g')
                .attr('class', 'y axis')
                .attr('transform', function(_, i) { return 'translate(0,' + i * size + ')'; })
                .each(function(d) { 
                    y.domain(d3.extent(d)); 
                    d3.select(this)
                        .call(yAxis); 
                });

            var cell = svg.append('g')
                .selectAll('g')
                .data(cross(keys, keys)).enter()
                .append('g')
                .attr('transform', (c) => `translate(${c.i * size},${c.j * size})`);

            cell.append('rect')
                .attr('fill', 'none')
                .attr('stroke', '#aaa')
                .attr('x', padding / 2 + 0.5)
                .attr('y', padding / 2 + 0.5)
                .attr('width', size - padding)
                .attr('height', size - padding);
            cell.each(function (c) {

                x.domain(d3.extent(data[c.i]));
                y.domain(d3.extent(data[c.j]));
                d3.select(this)
                    .selectAll('circle')
                    .data(points).enter()
                    .append('circle')
                    .attr('cx', (d) => { return x(d[c.x]); })
                    .attr('cy', (d) => { return y(d[c.y]); })
                    .attr('class', (_, i) => { return 'point' + i;});
            });
            cell.selectAll('circle')
                .attr('r', 3.5)
                .attr('fill-opacity', 0.7)
                .attr('fill', 'steelblue');
            
            svg.append('g')
                .style('font', 'bold 10px sans-serif')
                .selectAll('text')
                .data(keys).enter()
                .append('text')
                .attr('transform', (_, i) => `translate(${i * size},${i * size})`)
                .attr('x', 10)
                .attr('y', 10)
                .style('font-size', '15px')
                .text(d => d);

            svg.append('text')
                .attr('text-anchor', 'center')
                .attr('x', width / 2 - 30)
                .attr('y', -20)
                .text('Scatterplot Matrix');

            legend = svg.append('g')
                .attr('transform', 'translate(0,' + (height + 50) + ')')
                .attr('width', width)
                .attr('class','legend');
            legend.append('circle')
                .attr('cx', 5)
                .attr('cy', 7)
                .attr('r', 3.5)
                .attr('fill', 'steelblue');
            legend.append('text')
                .attr('text-ancor', 'start')
                .attr('x', 15)
                .attr('y', 10)
                .text('pokemon');

              
        },
        error: () => { alert('Fail to draw scatter plot matrix'); }
    });

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = 0; i < n; i++) { 
            for (j = 0; j < m; j++) {
                c.push({x: a[i], i: i, y: b[j], j: j});
            }
        }
        return c;
    }
}