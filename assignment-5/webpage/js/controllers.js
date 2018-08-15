/*
 * Calaca - Search UI for Elasticsearch
 * https://github.com/romansanchez/Calaca
 * http://romansanchez.me
 * @rooomansanchez
 *
 * v1.2.0
 * MIT License
 */

/* Calaca Controller
 *
 * On change in search box, search() will be called, and results are bind to scope as results[]
 *
*/
Calaca.controller('calacaCtrl', ['calacaService', '$scope', '$location', '$http' , '$sce', function(results, $scope, $location, $http, $sce ){

        //Init empty array
        $scope.results = [];

        //Init offset
        $scope.offset = 0;
        $scope.count_user = 0;
        $scope.val_ittr = {}
        var paginationTriggered;
        var maxResultsSize = CALACA_CONFIGS.size;
        var searchTimeout;

        // $scope.chickenEgg = "chicken"


        // $scope.items = [
        //   { id: 1, name: 'foo' },
        //   { id: 2, name: 'bar' },
        //   { id: 3, name: 'blah' }
        // ];

        $scope.delayedSearch = function(mode) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                $scope.search(mode)
            }, CALACA_CONFIGS.search_delay);
        }

        //On search, reinitialize array, then perform search and load results
        $scope.search = function(m){
            $scope.results = [];
            $scope.offset = m == 0 ? 0 : $scope.offset;//Clear offset if new query
            $scope.loading = m == 0 ? false : true;//Reset loading flag if new query

            if(m == -1 && paginationTriggered) {
                if ($scope.offset - maxResultsSize >= 0 ) $scope.offset -= maxResultsSize;
            }
            if(m == 1 && paginationTriggered) {
                $scope.offset += maxResultsSize;
            }
            $scope.paginationLowerBound = $scope.offset + 1;
            $scope.paginationUpperBound = ($scope.offset == 0) ? maxResultsSize : $scope.offset + maxResultsSize;
            $scope.loadResults(m);
        };

        $scope.update = function(URL, rated, re, i)
        {
          // console.log(($scope.name.toLowerCase() != "parth" & $scope.name.toLowerCase() != "priya"))

          name_check =  $scope.name == null || $scope.name == "" ||
                        $scope.name == undefined ||
                        ($scope.name.toLowerCase() != "parth" &
                        $scope.name.toLowerCase() != "priya")

          query_check = $scope.query == null || $scope.query == "" ||
                        $scope.query == undefined ||
                        ($scope.query.toLowerCase() != "founding father" &
                        $scope.query.toLowerCase() != "independence war causes")


          rating_check = re == -1 ||  re == null

          // console.log(re)

          if(name_check || query_check || rating_check)
          {

            if(rating_check) alert("please enter a valid rating")
            else if(name_check) alert("error author not correct")
            else alert("error query not correct")
          } else {


            if($scope.name.toLowerCase() == "parth") accessor_id = 1
            if($scope.name.toLowerCase() == "priya") accessor_id = 2
            if($scope.query.toLowerCase() == "independence war causes")
              queryid = 1

            if($scope.query.toLowerCase() == "founding father")
              queryid = 2

            data = {
              "urlname": URL,
              "accessor_id": accessor_id,
              "queryid": queryid,
              "query": $scope.query.toLowerCase(),
              "grade": re,
              "accessor": $scope.name.toLowerCase()
            }


            if(rated == true)
            {

              data["id"] =  $scope.val_ittr[i]["db_id"]
              // console.log(i, $scope.val_ittr[i]["id_ittr"])

              $http.put("http://localhost:3000/api/url_ratings", data)
             .then(
                 function(response){


                   // $scope.val_ittr[i]["db_id"] = response["data"]["id"]
                   // $scope.results[$scope.val_ittr[i]["id_ittr"]]["db_id"] = response["data"]["id"]
                   console.log($scope.results[$scope.val_ittr[i]["scope_id"]]["db_id"] , $scope.val_ittr[i]["db_id"] )


                   query_count = "?where[accessor_id]="+ accessor_id +"&where[queryid]=" + queryid
                   $http.get("http://localhost:3000/api/url_ratings/count" + query_count )
                     .then(function successCallback(response){
                       $scope.count_user = response["data"]["count"]
                     }, function errorCallback(response){

                     });


                 },
                 function(response){
                   console.log("Rating update failed")
                 }
              );


            } else {
              $http.post("http://localhost:3000/api/url_ratings", data)
             .then(
               function(response){
                   console.log("Ratings added")

                   // console.log($scope.results[$scope.val_ittr[i]["scope_id"]]["db_id"] , $scope.val_ittr[i]["db_id"] )

                   $scope.val_ittr[i]["db_id"] = response["data"]["id"]
                   $scope.results[$scope.val_ittr[i]["scope_id"]]["db_id"] = response["data"]["id"]
                   $scope.results[$scope.val_ittr[i]["scope_id"]]["rated"] = true

                   query_count = "?where[accessor_id]="+ accessor_id +"&where[queryid]=" + queryid
                   $http.get("http://localhost:3000/api/url_ratings/count" + query_count )
                     .then(function successCallback(response){
                       $scope.count_user = response["data"]["count"]
                     }, function errorCallback(response){

                     });


                 },
                 function(response){
                   console.log("Rating adding failed")
                 }
              );


            }

            $scope.results[i]["rating"] = re
            $scope.results[i]["rated"] = true

          }


        }

        //Load search results into array

        $scope.fetchresults = function(i, hits)
        {
          $http.get("http://localhost:3000/api/url_ratings?" + "filter[where][urlname]="+ hits["DOCNO"])
            .then(function successCallback(response){

                if(response["data"].length == 0)
                {
                  hits["rating"] = -1
                  hits["rated"] = false

                } else {

                  hits["rating"] = response["data"][0]["grade"]
                  hits["db_id"] = response["data"][0]["id"]
                  hits["rated"] = true
                }

                hits["TEXT"] = hits.TEXT.substr(0,1000)


                query_split = $scope.query.split(" ");
                for( word in query_split)
                {
                  // console.log(query_split[word])
                  hits["TEXT"] = hits["TEXT"].split(query_split[word]).join('<span class="search-highlight">'+ query_split[word] +'</span>')

                  // console.log(hits["TEXT"])
                }

                hits["TEXT"] = $sce.trustAsHtml(hits["TEXT"])


                hits["id_ittr"] = i
                s_id = $scope.results.push(hits);
                hits["scope_id"] = s_id - 1
                $scope.val_ittr[i] = hits



            }, function errorCallback(response){
                console.log("Unable to perform get request");
            });

        }
        $scope.loadResults = function(m) {



            results.search($scope.query, m, $scope.offset).then(function(a) {

                //Load results
                var i = 0;
                for(;i < a.hits.length; i++)
                {
                  // console.log(a.hits[i])
                  $scope.fetchresults(i, a.hits[i])
                }

                //Set time took
                $scope.timeTook = a.timeTook;

                //Set total number of hits that matched query
                $scope.hits = a.hitsCount;

                //Pluralization
                $scope.resultsLabel = ($scope.hits != 1) ? "results" : "result";

                //Check if pagination is triggered
                paginationTriggered = $scope.hits > maxResultsSize ? true : false;

                //Set loading flag if pagination has been triggered
                if(paginationTriggered) {
                    $scope.loading = true;
                }
            });

        };

        $scope.paginationEnabled = function() {
            return paginationTriggered ? true : false;
        };


    }]
);
