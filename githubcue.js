var username="punchagan";
var userData;
// http://stackoverflow.com/questions/1208067/wheres-my-json-data-in-my-incoming-django-request
var tags;
var getTags = function() {
    var descriptions;
    for (i in userData.descriptions) {
        descriptions = descriptions + ' ' + userData.descriptions[i];
    }

    var http = new XMLHttpRequest()
    var url = "http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction";
    var params = "appid=YahooDemo&output=json&context=" + descriptions;
    http.open("GET", url+'?'+params, true);
    
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            tags = JSON.parse(http.responseText).ResultSet.Result;
            getRepos(suggestions);
        }
    }
    http.send(null);
}

var run = function() {
    var gh_user = gh.user(username);

    var watch = gh_user.watching(function(data) {
        var repos = data.repositories;
        
        var languages = {};
        var descriptions = [];
        repos.forEach(function(elm, i, arr) {
            
            // Get language count for user 
            if (arr[i].language) {
                if (arr[i].language in languages) {
                    languages[arr[i].language]++;
                } else {
                    languages[arr[i].language] = 1;
                }
            }

            // Get descriptions of all the watched repos
            if (arr[i].description) {
                descriptions.push(arr[i].description)
            }
        })
        userData = {languages: languages, descriptions: descriptions};
        console.log("Obtained languages and descriptions");
        getTags();
    });
};


var random_nums = function(limit, num) {
    var indices = [Math.floor(Math.random()*num)];
    var i = 1;
    while (i < limit){
        var next = Math.floor(Math.random()*num);
        if (indices.indexOf(next) == -1) {
            indices.push(next);
            i++;
        };
    };
    return indices;
};

var interestingRepos = [];
var count=0;
var getRepos = function(callback) {
    
    var langIndices = random_nums(3, Object.keys(userData.languages).length);
    var descripIndices = random_nums(5, tags.length);
    console.log(langIndices, "<-- langIndices");
    console.log(descripIndices, "<-- descripIndices");
    for (i in langIndices) {
        for (j in descripIndices) {
            gh.repo.search(tags[descripIndices[j]], 
                           {"language": Object.keys(
                               userData.languages)[langIndices[i]]}, 
                           function(data) {
                               for (repo in data.repositories.slice(0, 10)) {
                                   interestingRepos.push(data.repositories[repo]);
                               };
                               count++;
                               callback();
                           });
        }
    }
}


var suggestions = function() {
    if (count == 15) {
        console.log(interestingRepos);
        interestIndices = random_nums(10, interestingRepos.length);
        console.log(interestIndices, "<-- interestIndices");
        for (repo in interestIndices) {
            console.log(interestIndices[repo])
            console.log(interestingRepos[interestIndices[repo]].name, 
                        interestingRepos[interestIndices[repo]].url)
        }
    }
}