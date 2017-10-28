'use strict';

angular.module('ethExplorer', ['ngRoute','ui.bootstrap'])

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'views/main.html',
                controller: 'mainCtrl'
            }).
            when('/block/:blockId', {
                templateUrl: 'views/blockInfos.html',
                controller: 'blockInfosCtrl'
            }).
            when('/transaction/:transactionId', {
                templateUrl: 'views/transactionInfos.html',
                controller: 'transactionInfosCtrl'
            }).
            when('/address/:addressId', {
                templateUrl: 'views/addressInfo.html',
                controller: 'addressInfoCtrl'
            }).
	  /*JGu: temporarily remove html/controller for address list
	    when('/addressList/:transactionId', {
	        templateUrl: 'views/addressList.html',
                controller: 'addressListCtrl'
		}).*/
            otherwise({
                redirectTo: '/'
            });
    }])
    .run(function($rootScope) {
        var web3 = new Web3();
        //var eth_node_url = 'http://localhost:8545'; // local host mode
	var eth_node_url_string = 'http://' + location.hostname + ':8545';  // remote URL. assuming eth_node server = web server. This can change. A DNS name is more flexible.
	var eth_node_url = new URL(eth_node_url_string);
	console.log("eth_node_url: " + eth_node_url);

	web3.setProvider(new web3.providers.HttpProvider(eth_node_url));

        $rootScope.web3 = web3;
        function sleepFor( sleepDuration ){
            var now = new Date().getTime();
            while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
        }
        var connected = false;
        if(!web3.isConnected()) {
            $('#connectwarning').modal({keyboard:false,backdrop:'static'}) 
            $('#connectwarning').modal('show') 
        }
    });
