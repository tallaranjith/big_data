/*
 * Simple TagCloud visualization
 * This view is an example for a simple visualization based on search results
 */
define(function(require, module) {
    var _ = require('underscore'), $ = require('jquery');
	var d3 = require("../d3/d3.min");
	require("../d3/modernizr");
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var Drilldown = require('splunkjs/mvc/drilldown');
    require("css!./svg.css");
	require("css!./matchtree.css");
	
    var TagCloud = SimpleSplunkView.extend({
        moduleId: module.id,
        className: 'matchtree-viz',
        options: {
            labelField: 'label',
            valueField: 'count',
			rotate: 10,
			sizeLimit: 50,
			getSize: 5,
            data: 'preview'
        },
        output_mode: 'json',
		

       createView: function() {
		  	  
		    var rotate = this.settings.get("rotate");
			 this.$el.html('');
			var svg=d3.select(this.el)
							
            return { container: this.$el, svg: svg};
        },
		formatData: function(data) {
			
			//data.reverse(); 
			var getWinner = [];
			var getLoser = [];
			var getFirstWinner = {};
			var getTotalWinner = [];
			var empty={};
			var i=1;
			//var getFirstWinner[value.Winner]='';
			$.each(data, function(index, value) {
				/* if(value.Round == "1st Round")
				{
					getWinner.push({'name': value.Winner,
					'round': value.Round,
					'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
					getLoser.push({'name': value.Loser,
					'round': value.Round,
					'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
					getFirstWinner[value.Winner]=[getWinner[index],getLoser[index]];
					
				} */
				  /* if(value.Round == "2nd Round")
				{ */
					if(getFirstWinner[value.Winner] && getFirstWinner[value.Loser])
					{
							
						getWinner.push({'name': value.Winner,
						'round': value.Round,'children':getFirstWinner[value.Winner],
						'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
						
						getLoser.push({'name': value.Loser,
						'round': value.Round,'children':getFirstWinner[value.Loser],
						'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
						getFirstWinner[value.Winner]=[getWinner[index],getLoser[index]];
							
					}
					else{
						
						
						getWinner.push({'name': value.Winner,
						'round': value.Round,'children':[],
						'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
						
						getLoser.push({'name': value.Loser,
						'round': value.Round,'children':[],
						'match':{'W1':value.W1,'L1':value.L1,'W2':value.W2,'L2':value.L2,'W3':value.W3,'L3':value.L3}});
						getFirstWinner[value.Winner]=[getWinner[index],getLoser[index]];
							
					}
				//} 
					
				
			});
			
			$.each(getFirstWinner, function(obj, values) {
					if(values[0].round == "7")
					{
						getTotalWinner=getFirstWinner[obj][0];
					}
				  

				});
			
			
			return getTotalWinner;
		},
        updateView: function(viz, data) {
						
						
						
										/* Wimbledon 2012 - Match Tree */
							/* Copyright 2013 Peter Cook (@prcweb); Licensed MIT */
						function matchreport(){
							var radius = 350, numRounds = 7, segmentWidth = radius / (numRounds + 1);

							var partition = d3.layout.partition()
							  .sort(null)
							  .size([2 * Math.PI, radius]) // x maps to angle, y to radius
							  .value(function(d) { return 1; }); //Important!

							var arc = d3.svg.arc()
							  .startAngle(function(d) { return d.x; })
							  .endAngle(function(d) { return d.x + d.dx; })
							  .innerRadius(function(d) { return d.y; })
							  .outerRadius(function(d) { return d.y + d.dy; });

							function translateSVG(x, y) {
							  return 'translate('+x+','+y+')';
							}

							function rotateSVG(a, x, y) {
							  a = a * 180 / Math.PI;
							  return 'rotate('+a+')';
							  return 'rotate('+a+','+x+','+y+')';
							}

							function arcSVG(mx0, my0, rx, ry, xrot, larc, sweep, mx1, my1) {
							  return 'M'+mx0+','+my0+' A'+rx+','+ry+' '+xrot+' '+larc+','+sweep+' '+mx1+','+my1;
							}

							var label = function(d) {
							  if(d.x === 0 && d.y === 0)
								return '';
							  var t = rotateSVG(d.x + 0.5 * d.dx - Math.PI * 0.5, 0, 0);
							  t += translateSVG(d.y + 0.5*d.dy, 0);
							  t += d.x >= Math.PI ? rotateSVG(Math.PI) : '';
							  return t;
							}

							function surname(d) {
							  return d.name.split(' ')[0];
							}

							function fullname(d) {
							  var s = d.name.split(' ');
							  return s.length === 3 ? s[2] + ' ' + s[0] + ' ' + s[1] : s[1] + ' ' + s[0];
							}

							function result(d) {
							  var m = d.match;
							  var res = '';
							  if(m !== undefined) {
								for(var i=1; i<=2; i++) {
								  if(m['W'+i] !== 0 && m['L'+i] !== 0)
									res += m['W'+i] + '-' + m['L'+i] + ' ';
								}
							  }
							  return res;
							}

							function playerHover(d) {
							  var c = surname(d);
							  d3.selectAll('g#player-labels text')
								.style('fill', 'white');

							  // Highlight this player + children
							  d3.select('g#player-labels text.'+c+'.round-'+d.round)
								.style('fill', 'yellow');

							  if(d.round != 1 && d.children) {
								c = surname(d.children[0]);
								d3.select('g#player-labels text.'+c+'.round-'+ +(d.round-1))
								  .style('fill', 'yellow');

								c = surname(d.children[1]);
								d3.select('g#player-labels text.'+c+'.round-'+ +(d.round-1))
								  .style('fill', 'yellow');
							  }

							  // var l = surname(d.children[1]);
							  // d3.selectAll('g#player-labels text.'+l)
							  //   .style('fill', 'gray');


							  var m = d.match;
							  if(m !== undefined) {
								d3.select('#result').text(fullname(d.children[0]) + ' beat ' + fullname(d.children[1]));
								d3.select('#score').text(result(d));
							  }
							}

							var xCenter = radius, yCenter = radius;
							var svg = d3.select("#matchtree").append('svg').attr("style","height: 700px; width: 700px;").append('g').attr('transform', translateSVG(xCenter,yCenter));

						//	d3.json('data/tree.json', function(err, root) {
							 
							  var chart = svg.append('g');
							  chart.datum(data).selectAll('g')
								.data(partition.nodes)
								.enter()
								.append('g');
										
							  // We use three groups: segments, round labels & player labels. This is to achieve a layering effect.

							  // Segments
							  chart.selectAll('g')
								.append('path')
								.attr('d', arc)
								.on('mouseover', playerHover);
									
							  // Round labels
							  var rounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Quarter finals', 'Semi finals', 'Final'];
							  var roundLabels = svg.append('g').attr('id', 'round-labels');
							  roundLabels.selectAll('path')
								.data(rounds)
								.enter()
								.append('path')
								.attr('d', function(d, i) {
								  var offset = (numRounds - i + 0.5) * segmentWidth - 10;
								  return arcSVG(-offset, 0, offset, offset, 0, 1, 1, offset, 0);
								})
								.style({'fill': 'none', 'stroke': 'none'})
								.attr('id', function(d, i) {return 'round-label-'+ +(i+1);});

							  roundLabels.selectAll('text')
								.data(rounds)
								.enter()
								.append('text')
								.append('textPath')
								.attr('xlink:href', function(d, i) {return '#round-label-'+ +(i+1);})
								.attr('startOffset', '50%')
								.text(function(d) {return d;});


							  // Player labels
							  var playerLabels = svg.append('g').attr('id', 'player-labels');
							  playerLabels.datum(data).selectAll('g')
								.data(partition.nodes)
								.enter()
								.append('text')
								.text(function(d, i) {return i === 0 ? surname(d) : d.name.slice(0, 3);})
								.attr('transform', label)
								.attr('dy', '0.4em')
								.attr('class', function(d) {return surname(d)+' round-'+ +(d.round);});
							  
						//	});
						}
						 Modernizr.load({
							test: Modernizr.svg,
							yep: matchreport()
						   // nope: ['js/jquery-1.9.1.min.js', 'js/fallback.js']
						  });

        }
    });
	return TagCloud;
});
