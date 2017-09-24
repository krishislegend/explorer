angular.module('ethExplorer')
    .controller('addressListCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

       var web3 = $rootScope.web3;
	
        $scope.init=function() {
            $scope.txId=$routeParams.transactionId;

            if($scope.txId!=undefined) {

	       getTransactionInfos()
                    .then(function(result){
		    // JGu: simulate the result from web3
		    var sim_addressList = [
					   "0x7e02b5ed58aefd5e09a377e277d5bb7ac2ac9015",
					   "0xf326dbf4458a617fe01d5f73a774ee5927a6bc6f",
					   "0x34d0192108ca0e94562a29804e8f776676c61910",
					   "0xdf9a59d48f4cc2397be885f54e91fb9aa7f7071e",
					   "0x27d18fd8195becf917f5d6354124807e0b193fd3",
					   "0x8dbed80c902ef320564c8bf8a9836194e5ecde89",
					   "0x2e61a474c54c717ea2cbb3faf0a127253e0da612",
					   "0x0265074f81efa15fc9bad0f724396cb1535bb832",
					   "0x9114ee7c0772c48e62c6275c7bb8e98aad0cc5b2",
					   "0xcfc159620fbd4d1dcf535b9410bb952e28f63d09",
					   "0x9e803a62bb53a6316afa69c101a165073495b6e4",
					   "0xb7750cf532742633cd04dbacce629a21e6fa31af"
					   ];
		    var addressListCount = sim_addressList.length;

		    /* JGu: TODO: $scope.$apply not working
		    $scope.addressList = [];
		    for (var addrIdx = 0; addrIdx < addressListCount; addrIdx++) {
		      // fetch address from web3 and write onto scope.addressList
		      $scope.$apply(
				    $scope.addressList.push(sim_addressList[addrIdx])
				    )
		    }
		    */
                    $scope.result = result;
		    $scope.addressListCount = addressListCount;
		    $scope.addressList = sim_addressList;
               });

	    } else {
                $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
            }

            function getTransactionInfos(){
                var deferred = $q.defer();

                web3.eth.getTransaction($scope.txId,function(error, result) {
                    if(!error){
                        deferred.resolve(result);
                    }
                    else{
                        deferred.reject(error);
                    }
                });
                return deferred.promise;

            }
        };

        $scope.init();

        console.log($scope.result);
	console.log($scope.addressListCount);

    });
