/*Chart-cloud visualization
 * This view is an example for a simple visualization based on search results
 */
define(function (require, module) {
	var _ = require('underscore'),
		$ = require('jquery');
	var d3 = require("../d3/d3.v3.min");
	var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
	var Drilldown = require('splunkjs/mvc/drilldown');
	require("css!./calendarChart.css");
	var calendarChart = SimpleSplunkView.extend({
		moduleId: module.id,
		className: 'calendarChart-viz',
		options: {
			data: 'preview'
		},
		output_mode: 'json',
		createView: function () {
			this.$el.html('');
			$('#legends').html('');
			return true;
		},
		updateView: function (viz, data) {
			var date_year = this.settings.get("date_year");
			var max_val = getHighLowVal(data, 'count', 1);
			var global_min_val = getHighLowVal(data, 'count', 0);
			var global_max_val = getHighLowVal(data, 'count', 1);
			var min_val = getHighLowVal(data, 'count', 0);
			/*Legends options*/
			mod_val = (max_val - min_val) / 12;
			legendsVal = [];
			for (i = 0; i < 12; i++) {
				intial_val = min_val;
				final_val = min_val + mod_val;
				if (i == 11) {
					legendsVal[i] = Math.ceil(intial_val) + " - " + Math.floor(final_val + 1);
				} else {
					legendsVal[i] = Math.ceil(intial_val) + " - " + Math.floor(final_val);
				}
				min_val = final_val;
			}
			var lengendsvg = d3.select("#legends").append("svg").attr("width", 200).attr("height", 800).attr("class", "RdYlGn").append("g");
			lengendsvg.append("text").text("Color").attr("width", 20).attr("height", 20).attr("x", 0).attr("y", 20);
			lengendsvg.append("text").text("Hits Range").attr("width", 20).attr("height", 20).attr("x", 60).attr("y", 20);
			def_color_y = 40;
			for (i = 0; i < 12; i++) {
				lengendsvg.append("rect").attr("class", "day " + "q" + i + "-12").attr("width", 20).attr("height", 20).attr("x", 0).attr("y", def_color_y);
				def_color_y = def_color_y + 30;
			}
			def_val_y = 55;
			$.each(legendsVal, function (index, value) {
				lengendsvg.append("text").text(value).attr("x", 60).attr("y", def_val_y);
				def_val_y = def_val_y + 30;
			});
			/*Legend options*/
			var width = 960,
				height = 750,
				cellSize = 25; // cell size
			var no_months_in_a_row = Math.floor(width / (cellSize * 7 + 50));
			var shift_up = cellSize * 3;
			var day = d3.time.format("%w"), // day of the week
			day_of_month = d3.time.format("%e"), // day of the month
			day_of_year = d3.time.format("%j"),
			week = d3.time.format("%U"), // week number of the year
			month = d3.time.format("%m"), // month number
			year = d3.time.format("%Y"),
			percent = d3.format("1"),
			format = d3.time.format("%Y-%m-%d");
			var color = d3.scale.quantize().domain([global_min_val, global_max_val]).range(d3.range(12).map(function (d) {
				return "q" + d + "-12";
			}));
			var svg = d3.select("#chart").selectAll("svg").data(d3.range(date_year, date_year+1)).enter().append("svg").attr("width", width).attr("height", height).attr("class", "RdYlGn").append("g")
			var rect = svg.selectAll(".day").data(function (d) {
				return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
			}).enter().append("rect").attr("class", "day").attr("width", cellSize).attr("height", cellSize).attr("x", function (d) {
				var month_padding = 1.2 * cellSize * 7 * ((month(d) - 1) % (no_months_in_a_row));
				return day(d) * cellSize + month_padding;
			}).attr("y", function (d) {
				var week_diff = week(d) - week(new Date(year(d), month(d) - 1, 1));
				var row_level = Math.ceil(month(d) / (no_months_in_a_row));
				return (week_diff * cellSize) + row_level * cellSize * 8 - cellSize / 2 - shift_up;
			}).datum(format);
			x_arr = [];
			y_arr = [];
			var month_titles = svg.selectAll(".month-title") // Jan, Feb, Mar and the whatnot
				.data(function (d) {
					return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
				}).enter().append("text").text(monthTitle).attr("x", function (d, i) {
					var month_padding = 1.2 * cellSize * 7 * ((month(d) - 1) % (no_months_in_a_row));
					x_arr[i] = month_padding;
					return month_padding;
				}).attr("y", function (d, i) {
					var week_diff = week(d) - week(new Date(year(d), month(d) - 1, 1));
					var row_level = Math.ceil(month(d) / (no_months_in_a_row));
					y_arr[i] = (week_diff * cellSize) + row_level * cellSize * 8 - cellSize - shift_up;
					return (week_diff * cellSize) + row_level * cellSize * 8 - cellSize - shift_up - 18;
				}).attr("class", "month-title").attr("d", monthTitle).style("font-size", "16px");
			dayTitle_arr = [];
			j = 0;
			for (i = 0; i < 12; i++) {
				dayTitle_arr[i] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
			}
			var day_titles = svg.selectAll(".day-title");
			$.each(dayTitle_arr, function (index, value) {
				day_titles.data(function (d) {
					return value;
				}).enter().append("text").text(function (d, i) {
					return d;
				}).attr("x", function (d, i) {
					return x_arr[index] + i * 26
				}).attr("y", function (d, i) {
					return y_arr[index]
				}).attr("class", "day-title").attr("d", function (d, i) {
					return d;
				}).style("font-size", "14px")
			});
			var year_titles = svg.selectAll(".year-title") // Jan, Feb, Mar and the whatnot
				.data(function (d) {
					return d3.time.years(new Date(d, 0, 1), new Date(d + 1, 0, 1));
				}).enter().append("text").text(yearTitle).attr("x", function (d, i) {
					return width / 2 - 100;
				}).attr("y", function (d, i) {
					return cellSize * 5.5 - shift_up - 20;
				}).attr("class", "year-title").attr("d", yearTitle);
			//  Tooltip Object
			var tooltip = d3.select("body").append("div").attr("id", "tooltip").style("position", "absolute").style("z-index", "10").style("visibility", "hidden").text("a simple tooltip");
			//d3.csv("dji.csv", function(error, csv) {
			//csv=data;
			var data1 = d3.nest().key(function (d) {
				return d.Date;
			}).rollup(function (d) {
				return d[0].count;
			}).map(data);
			rect.filter(function (d) {
				return d in data1;
			}).attr("class", function (d) {
				return "day " + color(data1[d]);
			}).select("title").text(function (d) {
				return d + ": " + percent(data1[d]);
			});
			//  Tooltip
			rect.on("mouseover", mouseover);
			rect.on("mouseout", mouseout);

			function mouseover(d) {
				tooltip.style("visibility", "visible");
				var percent_data = (data1[d] !== undefined) ? percent(data1[d]) : percent(0);
				var purchase_text = d + ": " + percent_data;
				tooltip.transition().duration(200).style("opacity", .9);
				tooltip.html(purchase_text).style("left", (d3.event.pageX) + 30 + "px").style("top", (d3.event.pageY) + "px");
			}

			function mouseout(d) {
				tooltip.transition().duration(500).style("opacity", 0);
				var $tooltip = $("#tooltip");
				$tooltip.empty();
			}
			//});
			function dayTitle(t0) {
				return t0.toString().split(" ")[2];
			}

			function monthTitle(t0) {
				return t0.toLocaleString("en-us", {
					month: "long"
				});
			}

			function yearTitle(t0) {
				return t0.toString().split(" ")[3];
			}

			function getHighLowVal(data, index, stat) {
				var result_val = [];
				i = 0;
				$.each(data, function (i, v) {
					result_val[i] = v[index];
					if (stat == 1) output_val = Math.max.apply(Math, result_val);
					else output_val = Math.min.apply(Math, result_val);
					i++;
				});
				return output_val;
			}
		}
	});
	return calendarChart;
});