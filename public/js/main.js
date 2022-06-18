
// Global objects
let data, scatterplot, barchart;

const dispatcher = d3.dispatch('filterCategories');

d3.csv('data/vancouver_trails_updated.csv')
    .then(_data => {
        data = _data;
        data.forEach(d => {
            d.time = +d.time;
            d.distance = +d.distance;
        });

        // Initialize scales
        const colorScale = d3.scaleOrdinal()
            .range(['#1916FE', '#FECF16', '#FE2316'])
            .domain(['Easy', 'Intermediate', 'Difficult']);

        scatterplot = new Scatterplot({
            parentElement: '#scatterplot',
            colorScale: colorScale
        }, data);
        scatterplot.updateVis();

        barchart = new Barchart({
            parentElement: '#barchart',
            colorScale: colorScale
        }, dispatcher, data);
        barchart.updateVis();
    })
    .catch(error => console.error(error));
dispatcher.on('filterCategories', selectedCategories => {
    if (selectedCategories.length == 0) {
        scatterplot.data = 0;
    } else {
        scatterplot.data = data.filter(d => selectedCategories.includes(d.difficulty));
    }
    scatterplot.updateVis();
});