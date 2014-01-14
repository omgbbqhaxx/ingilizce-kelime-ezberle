var app = angular.module('MyTutorialApp',[]);
app.controller("MainController", function($scope,$interval){
     $scope.Aralik = Math.floor(Math.random() * 4) + 0;
    $scope.mol = "scope works!";
    $interval(function() {
        var x = $scope.people[$scope.Aralik]; 
        if ($scope.google ==x.decode) {
        location.reload();
        
        }
     
    }, 300);
    
    
    
    
    $scope.people = [
		{
			id: 0,
			code: 'merhaba',
                        decode : 'hello'
			
		},
		{
			id: 1,
			code: 'görmek',
			decode : 'see'
		},
                {
			id: 2,
			code: 'asmak',
			decode : 'hang'
		},
                {
			id: 3,
			code: 'detay',
			decode : 'detail'
		}
		
		
	];
    
});