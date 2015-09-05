/**
 * Created by Heinfried on 5/25/2015.
 */
'use strict';

var HourlySalesController = function ($scope, $timeout, Restangular, AccessToken, DTOptionsBuilder, DTColumnDefBuilder) {
    var token = AccessToken.get();

    var recalcFromServer = function (inputDate) {
        Restangular.setDefaultHeaders({'Authorization': 'Bearer ' + token.access_token});
        Restangular.setDefaultRequestParams({'date': inputDate});
        Restangular.all('Reports/HourlySalesEventSourced').getList().then(function (entries) {
            //console.log(entries);
            $scope.entries = entries;
            $scope.DailySalesAmount = entries.DailySalesAmount;
        });

        $scope.dtOptions = DTOptionsBuilder.newOptions().withDOM('rtip').withDisplayLength(-1);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0),
            //DTColumnDefBuilder.newColumnDef(1).notVisible(),
            DTColumnDefBuilder.newColumnDef(2).notSortable().withOption('sWidth', '130px')
        ];
        //$('.page-spinner-bar').addClass('hide');
    }

    $scope.initEventSource = function () {
        if (token) {
            //console.log($scope.salesDate);

            var todaysDate = new Date();
            recalcFromServer(todaysDate);

            $scope.recalcSalesDate = function (data) {
                var newDate = new Date($scope.salesDate.getTime() + 180 * 60000);
                console.log('steve:' + newDate);
                recalcFromServer(newDate);
            }
        }
    }

    $scope.initSingleEntry = function () {
        if (token) {
            //Restangular.setDefaultRequestParams({'access_token': token.access_token});
            Restangular.setDefaultHeaders({'Authorization': token.token_type + " " + token.access_token});
            Restangular.setDefaultRequestParams({'date': '2015-04-30'});
                Restangular.one('Reports/HourlySalesSingleEntry').get().then(function(entries){
                $scope.entries = entries.HourlySales;
            });

            $scope.dtOptions = DTOptionsBuilder.newOptions().withDOM('rtip').withDisplayLength(-1);
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                //DTColumnDefBuilder.newColumnDef(1).notVisible(),
                DTColumnDefBuilder.newColumnDef(2).notSortable().withOption('sWidth', '130px')
            ];
            //$('.page-spinner-bar').addClass('hide');
        }
    }

    $scope.initMultiEntry = function () {
        if (token) {
            //Restangular.setDefaultRequestParams({'access_token': token.access_token});
            Restangular.setDefaultHeaders({'Authorization': 'Bearer ' + token.access_token});
            Restangular.setDefaultRequestParams({'date': "2015-04-30"});
            Restangular.one('Reports/HourlySalesMultipleEntries').get().then(function(entries){
                $scope.entries = entries.HourlySales;
            });

            $scope.dtOptions = DTOptionsBuilder.newOptions().withDOM('rtip').withDisplayLength(-1);
            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0),
                //DTColumnDefBuilder.newColumnDef(1).notVisible(),
                DTColumnDefBuilder.newColumnDef(2).notSortable().withOption('sWidth', '130px')
            ];
            //$('.page-spinner-bar').addClass('hide');
        }
    }

    $scope.initCumulativeSales = function () {
        $scope.chartConfig = {
            options: {
                chart: {
                    type: 'line'
                }
            },
            title: {
                text: 'Cumulative Sales'
            },
            xAxis : {
                title: {
                    text: 'Minute'
                }
            },
            yAxis: {
                title: {
                    text: 'Sales Amount'
                }
            },
            series: [{
                name: 'Sales By Minute'
            }]
        };

        if (token) {
            var today = new Date();
            var yyyy = today.getFullYear().toString();
            var mm = (today.getMonth() + 1).toString(); // getMonth() is zero-based
            var dd  = today.getDate().toString();

            var date_str = yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
            $('#salesDatePicker #salesDate').val(date_str);
        }
    }

    $scope.filterCumulativeSales = function() {
        var date_str = $('#salesDatePicker #salesDate').val();
        $scope.cumulativeSales = getCumulativeSales(date_str);
    }

    function getCumulativeSales(filter_date) {
        var sales_records = {};

        Restangular.setDefaultHeaders({'Authorization': 'Bearer ' + token.access_token});
        Restangular.setDefaultRequestParams({'date': filter_date});
        Restangular.one('Reports/CumulativeSales').get().then(function (entries) {
            $scope.cumulativeSales = entries.SalesByMinute;
            var series_data = [];
            for (var i = 0; i < $scope.cumulativeSales.length; i++) {
                series_data.push([$scope.cumulativeSales[i].MinuteOfDay, $scope.cumulativeSales[i].TotalAmount]);
            }

            $scope.chartConfig.series[0].data = series_data;
        });

        return sales_records;
    }
};