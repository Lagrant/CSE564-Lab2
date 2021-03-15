var PCPNumOrder = [];
var PCPFullOrder = [];
var names = [];
// var PCPNumNames = [];
// var PCPFullNames = [];

var uploadComp = function(evt) {
    token = evt.target.responseText;
    console.log(token);
    $.ajax({
        type: 'POST',
        url: '/mds1',
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            names = res['varNames'];
            var dataCoors = (function (){
                let _type = 'data', _size = 3.5, _color = 'steelblue', _title = 'Data';
                return {
                    coors: res['data'],
                    get type() {
                        return _type;
                    },
                    get size() {
                        return _size;
                    },
                    get color() {
                        return _color;
                    },
                    get title() {
                        return _title;
                    }
                }
            })();
            var varCoors = (function () {
                let _type = 'variable', _size = 7, _color = 'red', _title = 'Variables';
                return {
                    coors: res['var'],
                    names: res['varNames'],
                    get type() {
                        return _type;
                    },
                    get size() {
                        return _size;
                    },
                    get color() {
                        return _color;
                    },
                    get title() {
                        return _title;
                    }
                }
            })();
            plotScatter(d3.select('#data-mds-plot'), dataCoors);
            plotScatter(d3.select('#var-mds-plot'), varCoors);
            
            parallelCoorPlot(d3.select('#paral-num-plot'), '/num_dataset');
            parallelCoorPlot(d3.select('#paral-coor-plot'), '/full_dataset');
        },
        error: () => { alert('Fail to do MDS!'); }
    });
}

function plotScatter(div, points) {
    var width = parseInt(div.style('width')) - margin.left - margin.right;
    var height = parseInt(div.style('height')) - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain(d3.extent(points.coors, (d) => { return d[0]; }))
        .range([0, width]);
    var y = d3.scale.linear()
        .domain(d3.extent(points.coors, (d) => { return d[1]; }))
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');
    
    var svg = div.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    svg.append('g')
        .selectAll('.dot')
        .data(points.coors).enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => { return x(d[0]); })
        .attr('cy', (d) => { return y(d[1]); })
        .attr('r', points.size)
        .attr('fill', points.color)
        .attr('fill-opacity', 0.7);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .style('text-anchor', 'start');
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width + 10)
        .attr('y', height + 20)
        .text('x');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', 0)
        .attr('y', -10)
        .text('y');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2 - 20)
        .attr('y', -25)
        .text(points.title);

    switch (points.type) {
        case 'data':
            plotDataScatter();
            break;
        case 'variable':
            plotVarScatter();
            break;
        default:
            alert('Invalid data type');
            return;
    }

    function plotDataScatter() {
        svg.selectAll('.dot')
            .attr('class', (_, i) => { return 'point' + i; });
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

    function plotVarScatter() {

        svg.selectAll('.dot')
            .attr('class', (_, i) => { return points.names[i] + ' reorder-tag'; })
            .style('cursor', 'pointer')
            .style('stroke', 'darkblue')
            .style('stroke-width', '3px')
            .style('stroke-opacity', 0)
            .on('click', function () {
                var dot = d3.select(this);
                if (dot.style('stroke-opacity') == 0) {
                    dot.style('stroke-opacity', 1);
                    PCPNumOrder.push(dot.attr('class').split(' ')[0]);
                } else {
                    dot.style('stroke-opacity', 0);
                    var attrName = dot.attr('class');
                    for (let i = 0, len = PCPNumOrder.length; i < len; i++) {
                        if (PCPNumOrder[i] !== attrName) {
                            continue;
                        }
                        if (i === len - 1) {
                            PCPNumOrder.length = len - 1;
                            break;
                        }
                        for (let j = i; j < len; j++) {
                            PCPNumOrder[j] = PCPNumOrder[j+1];
                        }
                        PCPNumOrder.length = len - 1;
                        break;
                    }
                }
            });
        svg.selectAll('.attr-name')
            .data(points.coors).enter()
            .append('text')
            .attr('class', 'attr-name')
            .attr('text-anchor', 'start')
            .attr('x', (d) => { return x(d[0]); })
            .attr('y', (d) => { return y(d[1]); })
            .text((_, i) => { return points.names[i]});
    }

}

function parallelCoorPlot(div, url) {
    var width = parseInt(div.style('width')) - margin.left - margin.right;
    var height = parseInt(div.style('height')) - margin.top - margin.left;

    var svg = div.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + (margin.left - 70) + ',' + margin.top + ')');
    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2 - 20)
        .attr('y', -30)
        .text(() => {
            return (url === '/full_dataset') ? 'PCP of full dataset' : 'PCP of numerical Attributes';
        });
    $.ajax({
        type: 'POST',
        url: url,
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
            if (res instanceof String) {
                res = JSON.parse(res);
            }
            var attrs = d3.keys(res);
            // (url === '/full_dataset') ? PCPFullNames = attrs : PCPNumNames = attrs;
            var y = {};
            attrs.forEach(function (attr) {
                if (typeof res[attr][0] === 'number') {
                    y[attr] = d3.scale.linear()
                        .domain(d3.extent(res[attr]))
                        .range([height, 0]);
                } else {
                    let types = {};
                    res[attr].forEach(function (d) {
                        if (types[d] === undefined) {
                            types[d] = 1;
                        }
                    });
                    types = d3.keys(types);
                    y[attr] = d3.scale.ordinal()
                        .domain(types)
                        .rangeRoundBands([height, 0]);
                }
            });
            var x = d3.scale.ordinal()
                .domain(attrs)
                .rangePoints([0, width + 150], 1);
            
            var data = [];
            res[attrs[0]].forEach(function (_, i) {
                var temp = {};
                attrs.forEach(function (attr) {
                    temp[attr] = res[attr][i];
                });
                data.push(temp);
            });
            svg.selectAll(".paral-lines")
                .data(data)
                .enter().append("path")
                .attr("d",  path)
                .attr('class', (_, i) => { return 'line' + i + ' paral-lines'; })
                .style("fill", "none")
                .style("stroke", "steelblue")
                .style("opacity", 0.5);

            svg.selectAll(".y.axis")
                .data(attrs).enter()
                .append("g")
                .attr('class', function (d) { return 'y axis ' + d; })
                .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
                .each(function(d) { 
                    d3.select(this).call(d3.svg.axis()
                        .scale(y[d])
                        .orient('left')); 
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function(d) { return d; })
                .style("fill", "black");
            
            (url === '/num_dataset') ? d3.select('#num-pcp').on('click', reorder) : d3.select('#full-pcp').on('click', reorder);

            function path(d) {
                return d3.svg.line()(attrs.map(function (attr) {
                    if (typeof res[attr][0] !== 'number') {
                        return [x(attr), y[attr](d[attr]) + y[attr].rangeBand() / 2];
                    } else {
                        return [x(attr), y[attr](d[attr])];
                    }
                }));
            }

            function reorder() {
                var lst = (url === '/num_dataset') ? PCPNumOrder : PCPFullOrder;
                if (div[0][0].childElementCount === 0 || lst.length === 0) {
                    return;
                }
                // var currNames = (url === '/num_dataset') ? PCPNumNames : PCPFullNames;
                var currNames = attrs;
                var x = d3.scale.ordinal()
                    .domain(currNames)
                    .rangePoints([0, width + 150], 1);
                var positions = currNames.map(function (d) {
                    return x(d);
                });
                var oldOrder = [];
                lst.forEach(function (d) {
                    currNames.forEach(function (name, i) {
                        if (d === name) {
                            oldOrder.push(i);
                        }
                    });
                });
                oldOrder.sort((a,b) => { return a-b; });
                oldOrder.forEach(function (d, i) {
                    div.select('.' + lst[i])
                        .transition()
                        .duration(1000)
                        .attr('transform', 'translate(' + positions[d] + ')');
                    currNames[d] = lst[i];
                });
                
                svg.selectAll('.paral-lines').remove();
                svg.selectAll(".paral-lines")
                    .data(data)
                    .enter().append("path")
                    .attr("d",  path1)
                    .attr('class', (_, i) => { return 'line' + i + ' paral-lines'; })
                    .style("fill", "none")
                    .style("stroke", "steelblue")
                    .style("opacity", 0.5);
            
                finish();
            
                function finish() {
                    lst.length = 0;
                    d3.selectAll('.reorder-tag').style('stroke-opacity', 0);
                }
                function path1(d) {
                    return d3.svg.line()(currNames.map(function (name) {
                        if (typeof res[name][0] !== 'number') {
                            return [x(name), y[name](d[name]) + y[name].rangeBand() / 2];
                        } else {
                            return [x(name), y[name](d[name])];
                        }
                    }));
                }
            }
        },
        error: () => { alert('Fail to retrieve the full dataset'); }
    });
}

