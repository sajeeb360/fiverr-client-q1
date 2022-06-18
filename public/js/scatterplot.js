class Scatterplot {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 60 },
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = 600 - vis.config.margin.left - vis.config.margin.right;
    vis.height = 400 - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickSize(-vis.height - 10)
      .tickPadding(10)


    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(10)
      .tickSize(-vis.width - 10)
      .tickPadding(10)
      .tickFormat(d => d + ' km');

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis')
    // Append both axis titles
    vis.chart.append('text')
      .attr('class', 'axis-title')
      .attr('y', vis.height - 15)
      .attr('x', vis.width + 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Hours');

    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.81em')
      .text('Distance');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    // Specificy accessor functions
    vis.colorValue = d => d.difficulty;
    vis.xValue = d => d.distance;
    vis.yValue = d => d.time;

    // Set the scale input domains
    vis.xScale.domain([0, 30]);
    vis.yScale.domain([12, 0]);

    vis.renderVis();
  }
  renderVis() {
    let vis = this;



    // Add circles
    const circles = vis.chart.selectAll('.point')
      .data(vis.data, d => d.trail)
      .join('circle')
      .attr('class', 'point')
      .attr('r', d => Math.sqrt(parseInt(vis.yValue(d) + 1.2)) * 2.6)
      .attr('cy', d => vis.yScale(vis.yValue(d)))
      .attr('cx', d => vis.xScale(vis.xValue(d)))
      .attr('fill', d => vis.config.colorScale(vis.colorValue(d)))
      .style("opacity", 0.55)
    // Tooltip event listeners
    circles
      .on('mouseover', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
              <div class="tooltip-title">Trail: ${d.trail}</div>
              <div><i>Region: ${d.region}</i></div>
              <ul>
                <li>Distance: ${d.distance} km</li>
                <li>Time: ${d.time} hours</li>
                <li>Difficulty: ${d.difficulty}</li>
                <li>Seasion: ${d.season}</li>
              </ul>
            `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove())
  }
}