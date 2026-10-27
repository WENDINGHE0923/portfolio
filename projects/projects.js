import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedYear = null;


function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  d3.select('svg').selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

arcs.forEach((arc, i) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .attr('class', data[i].label === selectedYear ? 'selected' : '')
    .on('click', () => {
      selectedYear = data[i].label === selectedYear ? null : data[i].label;
      applyFilters();
    });
});



  let legend = d3.select('.legend');
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
function applyFilters() {
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    let matchesQuery = values.includes(query.toLowerCase());
    let matchesYear = selectedYear === null || project.year === selectedYear;
    return matchesQuery && matchesYear;
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
}

renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  applyFilters();
});

