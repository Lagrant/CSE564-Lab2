var uploadComp = function(evt) {
    token = evt.target.responseText;
    console.log(token);
    $.ajax({
        type: 'POST',
        url: '/mds1',
        contentType: 'application/json; charset=UTF-8',
        success: function (res) {
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
        },
        error: () => { alert('Fail to do MDS!'); }
    });
}

function plotScatter(div, points) {
    var width = parseInt(div.style('width')) - margin.top - margin.bottom;
    var height = parseInt(div.style('height')) - margin.left - margin.right;

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
        .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');
    
    svg.append('g')
        .selectAll('.dot')
        .data(points.coors).enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => { return x(d[0]); })
        .attr('cy', (d) => { return y(d[1]); })
        .attr('r', points.size)
        .attr('fill', points.color)
        .attr('fill-opacity', 0.7)

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