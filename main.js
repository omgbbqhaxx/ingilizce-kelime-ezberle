angular.module('App', []);

function Ctrl($scope) {
  $scope.user = {name: 'guest', last: 'visitor'};
        $scope.Aralik = Math.floor(Math.random() * 4) + 0;
	$scope.check = function() {
		var re = new RegExp(this.peoples.code);
		return re;
		};
		
        $scope.submit = function() {
            if (this.peoples.decode == this.text) {
            alert("Doğru");
         location.reload();
            }else{
                alert("Hatalı");
                location.reload();
         }
        
         };
        
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
  
}
