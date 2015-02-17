function fnDBBillingCashByPtr_OnLoad() {
    xml.src = hashParam();
}
function hashParam() {
    return 'dset.xml'
}

angular.module('pwc', [])
    .directive('datasrc', function ($compile) {
        return {
            restrict: 'A',
            scope: true,
            controller: function ($scope) {

            },
            compile: function (tElem, tAttrs) {
                return {
                    pre: function (scope, iElem, iAttrs) {
                        var dsrcid = iAttrs.datasrc;
                        if (iAttrs.datafld) {
                            $(iElem).children().attr('ng-repeat', 'ds in ds.' + iAttrs.datafld );
                        }
                        else {
                            if (!scope.$$listeners[dsrcid.substring(1)]) {
                                scope.$on(dsrcid.substring(1), function (event, args) {
                                    if (args) {
                                        var x2js = new X2JS();
                                        var ds = x2js.xml2json(args.datasource.firstElementChild);

                                        for (var key in ds) {
                                            console.log(key);
                                            if (Object.prototype.toString.call(ds[key]) === "[object Array]") {
                                                $(iElem).children().attr('ng-repeat', 'ds in ds.' + key);
                                                break;
                                            }
                                        }
                                        console.log(args.datasource.firstElementChild);
                                        scope.ds = ds;
                                        console.log(ds)
                                        $compile(iElem.contents())(scope);
                                    }
                                });
                            }
                        }

                    },
                    post: function (scope, iElem, iAttrs) {
                    }
                }
            },
            link: function (scope, elem, attrs) {


            }
        }
    })
    .directive('datafld', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, elem, attr) {
                if (!attr.datasrc) {
                    if (attr) {
                        if (elem[0].tagName.toLowerCase() == 'img') {
                            elem.attr('ng-src', '{{ds.' + attr.datafld + '|| ds._' + attr.datafld + "}}");
                        }
                        else
                            elem.attr('ng-bind', 'ds.' + attr.datafld + '|| ds._' + attr.datafld);
                    }
                }
            }
        }
    })
    .directive('xml', function ($http) {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, elem, attrs) {
                if (attrs.id) {
                    var xmlObjName = attrs.id;
                    window[xmlObjName] = {
                        set src(url) {
                            $http.get(url).then(function (response) {
                                console.log(response.data);
                                var parser = new DOMParser();
                                var xmlDoc = parser.parseFromString(response.data, "text/xml");
                                window[xmlObjName].XMLDocument = xmlDoc;
                                console.log(xmlDoc)
                                scope.$broadcast(xmlObjName, {datasource: xmlDoc})
                            });
                        }
                    };
                }
            }
        }
    })
    .run(function ($rootScope) {
        $rootScope.reload = function () {
            xmlSrcBillingCashByPtrBilling.src = '/trees2.xml';
            if (document.fullscreenEnabled) {
                document.body.requestFullScreen();
            }
            else if (document.webkitFullscreenEnabled) {
                document.body.webkitRequestFullScreen();
            }
            else if (document.mozFullScreenEnabled) {
                document.body.mozRequestFullScreen();
            }
            else if (document.msFullscreenEnabled) {
                document.body.msrequestFullScreen();
            }
        };
        $rootScope.openModal = function(){
            var myObject = new Object();
            myObject.firstName = "warren";
            myObject.lastName = "wei";
            var returnVal  = window.showModalDialog("modal.html", myObject, "dialogHeight:300px; dialogLeft:200px;");
            alert('here');
        }
        /*$http.get('/trees.xml').then(function (response) {
         var parser = new DOMParser();
         var xmlDoc = parser.parseFromString(response.data, "text/xml");
         var x2js = new X2JS();
         var ds = x2js.xml2json(xmlDoc);
         console.log(response.data)
         $rootScope.datasrc = ds
         });*/
    })
    .controller('app', function ($scope) {
    });

function paste(elem){
    console.log(event.srcElement.tagName);
    var desc = elem.value + window.event.clipboardData.getData("Text");
}