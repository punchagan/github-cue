var username;
var userData;
var repos;
// http://stackoverflow.com/questions/1208067/wheres-my-json-data-in-my-incoming-django-request
var tags;
var interestingRepos;
var count=0;
var langIndices;
var descripIndices; 

var getTags = function() {
    var descriptions;
    for (i in userData.descriptions) {
        descriptions = descriptions + ' ' + userData.descriptions[i];
    }

    var http = new XMLHttpRequest()
    var url = "http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction";
    var params = "appid=YahooDemo&output=json&context=" + encodeURIComponent(descriptions);
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            tags = JSON.parse(http.responseText).ResultSet.Result;
            getRepos(suggestions);
        }
    }
    http.send(params);
}

var run = function() {
    username = localStorage.login;
    var gh_user = gh.user(username);

    var watch = gh_user.watching(function(data) {
        repos = data.repositories;
        
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
        getTags();
    });
};


var random_nums = function(limit, num) {
    if (limit > num) {
        limit = num;
    }
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

var getRepos = function(callback) {
    interestingRepos = new Array;
    langIndices = random_nums(3, Object.keys(userData.languages).length);
    descripIndices = random_nums(5, tags.length);
    for (i in langIndices) {
        for (j in descripIndices) {
            var language = Object.keys(userData.languages)[langIndices[i]];
            var tag = tags[descripIndices[j]];
            if (tag==undefined) {tag="github"} else {tag=encodeURIComponent(tag)};
            if (language==undefined) {
                gh.repo.search(tag, {},  
                               function(data) {
                                   for (repo in data.repositories.slice(0, 10)) {
                                       interestingRepos.push(data.repositories[repo]);
                                   };
                                   count++;
                                   callback();
                               });
            }
            else {
                gh.repo.search(tag, 
                               {"language": encodeURIComponent(language)}, 
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
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.ask == "interesting")
            sendResponse({irepos: interestingRepos});
        else
            sendResponse({}); // snub them.
    }
);

var uniquifyRepos = function (a, b) {
    var unique = new Array;
    for ( i=0; i < a.length; i++ ) {
        if (unique.indexOf(a[i])==-1 && b.indexOf(a[i])==-1) {
            unique.push(a[i]);
        }
    }
    return unique; 
}

var suggestions = function() {
    if (count == langIndices.length*descripIndices.length) {
        count=0;
        interestingRepos=new uniquifyRepos(interestingRepos, repos);
        chrome.tabs.executeScript(gittab, {file: "github.js"}, function(){
            chrome.tabs.executeScript(gittab, {file: "suggestions.js"});
        });
    }
}

