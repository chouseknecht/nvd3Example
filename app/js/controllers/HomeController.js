/*****************************************
 * Copyright (c) 2014 Chris Houseknecht
 *
 * HomeController.js
 *
 * Main page controller
 *
 */

'use strict';

var mod = angular.module('sampleAppControllers', []);

mod.controller('HomeController', ['$scope', '$http', '$log',
function($scope, $http, $log) {
    var url = '/app/data/plotwatt_appliance_data.csv',
        baseData = [];

    $http({ method:'GET', url: url })
        .success(function(data) {
            //parse the data into something usable
            var rows = data.split(/\n/);
            rows.forEach(function(row, idx) {
                var set, r, vals;
                if (!/^#/.test(row)) {
                    r = row.replace(/ /g,'');
                    vals = r.split(/,/);
                    baseData.push({
                        always: parseFloat(vals[0]),
                        hvac: parseFloat(vals[1]),
                        refrigeration: parseFloat(vals[2]),
                        dryer: parseFloat(vals[3]),
                        cooking: parseFloat(vals[4]),
                        other: parseFloat(vals[5]),
                        date: new Date(vals[6])
                    });
                }
            });
            $scope.$emit('BaseDataReady');
        })
        .error(function(data, status) {
            $log.error('Error: Attempted to load ' + url + ' GET returned ' + status);
        });

    if ($scope.removeBaseDataReady) {
        $scope.removeBaseDataReady();
    }
    $scope.removeBaseDataReady = $scope.$on('BaseDataReady', function() {

        var day, mth, dt, always, hvac, refrigeration, dryer, cooking, other, yr,
            summaryByDay = [],
            datum = [];

        function reset(idx) {
            always = 0;
            hvac = 0;
            refrigeration = 0;
            dryer = 0;
            cooking = 0;
            other = 0;
            day = baseData[idx].date.getUTCDate();
            mth = baseData[idx].date.getUTCMonth();
            dt = baseData[idx].date;
        }

        // Summarize the data by day
        summaryByDay = [];
        reset(0);
        baseData.forEach(function(set, idx) {
            if (set.date.getUTCDate() === day && set.date.getUTCMonth() === mth) {
                always += set.always;
                hvac += set.hvac;
                refrigeration += set.refrigeration;
                dryer += set.dryer;
                cooking += set.cooking;
                other += set.other;
            } else {
                summaryByDay.push({
                    always: always,
                    hvac: hvac,
                    refrigeration: refrigeration,
                    dryer: dryer,
                    cooking: cooking,
                    other: other,
                    date: dt
                });
                reset(idx + 1);
                always += set.always;
                hvac += set.hvac;
                refrigeration += set.refrigeration;
                dryer += set.dryer;
                cooking += set.cooking;
                other += set.other;
            }
        });
        summaryByDay.push({
            always: always,
            hvac: hvac,
            refrigeration: refrigeration,
            dryer: dryer,
            cooking: cooking,
            other: other,
            date: dt
        });

        datum[0] = {
            key: 'Always On',
            values: summaryByDay.map(function(set) {
                    return { x: set.date, y: set.always };
                })
        };
        datum[1] = {
            key: 'Heating & A/C',
            values: summaryByDay.map(function(set) {
                return { x: set.date, y: set.hvac };
            })
        };
        datum[2] = {
            key: 'Refrigeration',
            values: summaryByDay.map(function(set) {
                return { x: set.date, y: set.refrigeration };
            })
        };
        datum[3] = {
            key: 'Dryer',
            values: summaryByDay.map(function(set) {
                return { x: set.date, y: set.dryer };
            })
        };
        datum[4] = {
            key: 'Other',
            values: summaryByDay.map(function(set) {
                return { x: set.date, y: set.other };
            })
        };

        /*nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
              .transitionDuration(350)
              .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
              .rotateLabels(0)      //Angle to rotate x-axis labels.
              .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
              .stacked(true)
              .groupSpacing(0.1)    //Distance between each group of bars.
            ;

            chart.xAxis
                .tickFormat(d3.time.format('%m-%d'));

            chart.yAxis
                .tickFormat(d3.format(',.3f'));

            d3.select('#chart svg')
                .datum(datumForYear['ALL'])
                .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });*/

        nv.addGraph(function() {
            var chart = nv.models.stackedAreaChart()
                          .margin({right: 100})
                          .x(function(d) { return d.x })   //We can modify the data accessor functions...
                          .y(function(d) { return d.y })   //...in case your data is formatted differently.
                          .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                          .rightAlignYAxis(true)      //Let's move the y-axis to the right side.
                          .transitionDuration(500)
                          .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                          .clipEdge(true);

            //Format x-axis labels with custom function.
            chart.xAxis
                .tickFormat(function(d) {
                  return d3.time.format('%m-%d')(new Date(d))
            });

            chart.yAxis
                .tickFormat(d3.format(',.3f'));

            d3.select('#chart svg')
              .datum(datum)
              .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
          });

    });

}]);
