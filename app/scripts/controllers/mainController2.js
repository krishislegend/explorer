angular.module('ethExplorer')
  .controller('mainCtrl2', function ($rootScope, $scope, $location, $routeParams) {

	var web3 = $rootScope.web3;
	var blockNum;

	$scope.init = function() {
	  var maxBlocks = 50;
	  $scope.lastBlockNum = parseInt(web3.eth.blockNumber, 10);
	  $scope.blockNum = parseInt($routeParams.blockListId, 10);

	  blockNum = $scope.blockNum;
	  if (maxBlocks > blockNum) {
	    maxBlocks = blockNum + 1;
	  }

	  // get latest 50 blocks
	  $scope.blocks = [];
	  for (var i = 0; i < maxBlocks; ++i) {
	    $scope.blocks.push(web3.eth.getBlock(blockNum - i));
	  }  
	};
	
	$scope.processBlockListRequest = function() {
	  blockNum = $scope.blockNum = parseInt($scope.blockListRequest, 10);
	  return $location.path('/'+blockNum);
	};

        $scope.processRequest = function() {
             var requestStr = $scope.ethRequest.split('0x').join('');

            if (requestStr.length === 40)
              return goToAddrInfos(requestStr)
            else if(requestStr.length === 64) {
              if(/[0-9a-zA-Z]{64}?/.test(requestStr))
                return goToTxInfos('0x'+requestStr)
              else if(/[0-9]{1,7}?/.test(requestStr))
                return goToBlockInfos(requestStr)
            }else if(parseInt(requestStr) > 0)
              return goToBlockInfos(parseInt(requestStr))

            alert('Don\'t know how to handle '+ requestStr)
        };

        function goToBlockInfos(requestStr) {
            $location.path('/block/'+requestStr);
        }

        function goToAddrInfos(requestStr) {
            $location.path('/address/'+requestStr);
        }

	function goToTxInfos (requestStr) {
             $location.path('/transaction/'+requestStr);
        }

	$scope.init();
    });
