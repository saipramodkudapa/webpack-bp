import {
    select,
    csv,
    scaleLinear,
    max,
    min,
    extent,
    scaleBand,
    axisLeft,
    axisBottom,
    format,
    scaleSequential,
    interpolatePlasma,
    histogram
} from 'd3';

const svg = select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

const render = (data) => {

// margin related code
    const margin = { top: 20, left: 40,
        right: 20, bottom: 40};
    const innerHeight =
        height - margin.top - margin.bottom
    const innerWidth =
        width - margin.left - margin.right

// svg is like canvas div, g is group element
    const g = svg.append('g')
        .attr('transform',`translate
  						(${margin.left},${margin.top})`);

    const distFreqMap = dupData => {
        const freqMap = {};
        const disData = new Set(dupData);
        disData.forEach(distEle => {
            freqMap[distEle] =
                dupData.filter(
                    dupEle => dupEle == distEle).length
        });
        return freqMap;
    };
    const makeBarChart = (barData) => {
        const fmap = distFreqMap(barData);
        console.log(Object.keys(fmap));
        console.log(Object.values(fmap))
        updateBars(
            Object.values(fmap),
            Object.keys(fmap));
    }

// update bars and axes
    const updateBars = (
        yData, // y axis array
        xData = data.map(d=>d['players']), // x axis arr
        isBar = true,
        xscaleDomain = '') => {

// delete old axes if any
        g.selectAll('.yAxis, .xAxis').remove()

// define scales
        const yScale = scaleLinear()
            .domain([0, max(yData)]) // pass y-array
            .range([innerHeight, 0]);

        var xScale = scaleBand()
            .domain(xData)  // pass x array
            .range([0, innerWidth])
            .padding(0.10);

        if(!isBar){
            console.log('xData', xData);
            xScale = scaleLinear()
                .domain(xscaleDomain).nice()
                .range([0, innerWidth]);
        }
        const barWidth = d => {
            if(isBar){
                return xScale.bandwidth();
            }else{
                return Math
                    .max(0, xScale(xData[d].x1) - xScale(xData[d].x0) - 1);
            }
        }

        const barXattr = d => {
            if(isBar){
                return xScale(xData[d]);
            }else{
                return (xScale(xData[d].x0) + 1);
            }
        }

// define x-array


// making Axis and customizing it
        const yAxis = axisLeft(yScale)
        const xAxis = axisBottom(xScale)

        g.append('g').attr('class','yAxis').call(yAxis);
        g.append('g').attr('class','xAxis').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);

        // adding bars for new data
        var bars = g.selectAll('rect').data(yData) // y-array
        bars.enter()
            .append('rect')
            .attr('x', (d,i) => barXattr(i)) //
            .attr('y', d => yScale(d)) //
            .attr('width', (d,i) => barWidth(i))
            .attr('height',
                d =>innerHeight - yScale(d)) //
            .attr('fill', "steelblue")
            .on('mouseover', function(d) {
                const selection = select(this);
                selection
                    .attr('fill','orange')
                    .attr('stroke', 'orange')
                    .attr('stroke-width', 20);
            })
            .on("mouseout", function(d) {
                    const selection = select(this);
                    selection
                        .transition()
                        .duration(250)
                        .attr('fill','steelblue')
                        .attr('stroke',"")
                }
            );

        // update bars
        bars.transition().duration(250)
            .attr('y',d => yScale(d))
            .attr('height', d => innerHeight - 			                yScale(d))
            .attr('x', (d,i) => barXattr(i))			   					.attr('width', (d,i) => barWidth(i))
        ;

        //remove old bars
        bars.exit().remove()

    }// end of update bars

    makeBarChart(data.map(d=>d['nationality']))

    const chartMap = {
        'histogram' : ['age', 'value', 'wage', 'finishing', 'crossing', 'acceleration', 'shooting', 'passing', 'dribbling'],
        'barchart' : ['nationality']
    }

    const dropdownChange = () => {
        const yColumn = document
            .getElementById('dd-id')
            .value
        const yData = data.map(d=>d[yColumn])
        if(chartMap['histogram'].includes(yColumn)){
            var x = scaleLinear()
                .domain(extent(yData)).nice()
                .range([0, innerWidth])
            var histBins = histogram()
                .domain(x.domain())
                .thresholds(x.ticks(10))(yData)
            const histYData = histBins.map(hb => hb.length)
            updateBars( histYData, histBins, false, 		extent(yData));
            // updateBars(yData);
        }else{
            console.log('bar chart variable selected');
            console.log(yData);
            makeBarChart(yData);
        }
    }

    const dropdown =
        select("#dd-container")
            .insert('select', 'svg')
            .on('change', dropdownChange)
            .attr('id', 'dd-id')

    const attributes = ['nationality', 'value', 'wage', 'finishing', 'crossing', 'acceleration', 'shooting', 'passing', 'dribbling', 'international_reputation', 'work_rate', 'overall', 'age', 'skill_moves', 'position']

    dropdown.selectAll('option')
        .data(attributes)
        .enter().append('option')
        .attr('value', d => {return d})
        .text(d => {return d});

}; // end of render

csv('data.csv').then(data => {
    data.forEach(d => {
        d.goals = +d.goals;
        d.age = +d.age;
    });
    render(data);

})