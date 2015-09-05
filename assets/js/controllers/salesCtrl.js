/**
 * Created by Heinfried on 5/25/2015.
 */
'use strict';

var SalesController = function ($scope, $timeout, Restangular, AccessToken, DTOptionsBuilder, DTColumnDefBuilder, $stateParams) {
    var token = AccessToken.get();

    $scope.initSalesPage = function() {
        if (token) {
            //Restangular.setDefaultRequestParams({'access_token': token.access_token});
            Restangular.setDefaultHeaders({'Authorization': 'Bearer ' + token.access_token});
            Restangular.all('SalesTransactions').getList().then(function(entries){
                $scope.entries = entries;
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

    $scope.initSalesDetailPage = function () {
        //Restangular.setDefaultRequestParams({'access_token': token.access_token});
        Restangular.setDefaultHeaders({'Authorization': 'Bearer ' + token.access_token});
        // we first get the customers

        Restangular.one('SalesTransactions', $stateParams.id).get().then(function(salesTransaction){
            $scope.salesTransaction = salesTransaction;
            $scope.salesTransactionLines = salesTransaction.SalesTransactionLines;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withDOM('rtip').withDisplayLength(-1);

            //$('.page-spinner-bar').addClass('hide');
        });
    }
}