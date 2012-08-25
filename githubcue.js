// Utility function to get "num" random numbers below "limit".
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


// Main entry point
// Fetches all the watched repos of the user and triggers off everything else...
var run = function() {

    insertStubHtml();

    // Workaround the lack of access to localStorage ...
    chrome.extension.sendRequest({message: "credentials"}, function(response) {

        // Globally available
        github = new Github({username: response.username,
                             password: response.password});
        var gh_user = github.getUser(),
            watch = gh_user.userWatched(response.username, processDataAndDisplay);
        console.log('Fetching watched repos');
    });
};

// Inserts the html with a message indicating that we are fetching repos.
var insertStubHtml = function(){
    var yrepo = document.getElementById("your_repos"),
        interesting = yrepo.cloneNode(),
        heading = document.createElement("h2"),
        top_bar = document.createElement("div"),
        bottom_bar = top_bar.cloneNode(),
        repo_list = document.createElement("ul");
        messages = document.createElement("span");

    messages.id = "interesting_messages";
    // FIXME: CSS fixes
    messages.textContent = "Fetching interesting repositories. Please Wait...";
    repo_list.className = "repo_list";
    bottom_bar.className = "bottom-bar";
    heading.textContent = "Interesting Repositories ";
    top_bar.className = "top-bar";
    top_bar.appendChild(heading);
    interesting.id = "interest_repos";
    interesting.appendChild(top_bar);
    interesting.appendChild(repo_list);
    interesting.appendChild(messages);
    interesting.appendChild(bottom_bar);

    yrepo.insertAdjacentElement("beforeBegin", interesting);

}

// Calls all the functions for processing and displaying ...
var processDataAndDisplay = function( err, repos ) {

    // FIXME: Does no error handling.
    // on success err is null
    console.log(err);

    var userData = parseRepoData(repos);
    getTags(userData);

};

// Parses the data of all watched repos of the user
// Returns a json object
//     - language : a dict of language name to count of repos
//     - descriptions: a list of all descriptions of repos
var parseRepoData = function(repos) {

    var languages = {},
        descriptions = [];

    repos.forEach( function(elm, i, arr) {

        var repo = repos[i];

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
    });

    return {languages: languages, descriptions: descriptions};

};

// Get tags using Yahoo's content analysis service from all the descriptions
// available.  Then passes on the tags for further action to XXX.
var getTags = function(userData) {

    var descriptions = userData.descriptions.join(' ');
    console.log('Getting keywords from descriptions');

    var http = new XMLHttpRequest()
    var url = "http://search.yahooapis.com/ContentAnalysisService/V1/termExtraction";
    var params = "appid=YahooDemo&output=json&context=" + encodeURIComponent(descriptions);
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            tags = JSON.parse(http.responseText).ResultSet.Result;
            getRepos(userData);
        }
    }

    http.send(params);
}

// Searches for repos using Github's search API
var getRepos = function(userData) {
    console.log('Searching interesting repos based on keywords');
    var interestingRepos = new Array,
        langIndices = random_nums(3, Object.keys(userData.languages).length),
        descripIndices = random_nums(5, tags.length),
        totalCallCount = langIndices.length * descripIndices.length;
        search = github.getSearch(),
        count = 0,
        ourCallBack = function( err, data ) {
            count += 1;
            // Call the callback to insert repos, only if all keyword searches
            // have been done.  Count no. of searches made and compare with
            // total expected number.
            selectInterestingRepos( data, interestingRepos, count == totalCallCount);
        };

    for (i in langIndices) {
        for (j in descripIndices) {
            var language = Object.keys(userData.languages)[langIndices[i]];
            var tag = tags[descripIndices[j]];
            // there should be no undefined tags, but ...
            if (tag==undefined) {tag="github"} else {tag=encodeURIComponent(tag)};
            search.searchRepos(tag, ourCallBack, language);
            // callback();
        }
    }
}

var selectInterestingRepos = function(data, repos, call) {
    for (i in data.repositories.slice(0, 9)) {
        var repo = data.repositories[i];
        if (repos.indexOf(repo) == -1) { repos.push(repo) };
    };
    if (call) { showSuggestions(repos); };
}


var showSuggestions = function(repos) {
    console.log('Displaying suggestions...');
    var indices = random_nums(15, repos.length),
        node = document.getElementById("interest_repos"),
        messages = document.getElementById("interesting_messages")
        repo_list = node.getElementsByClassName("repo_list")[0];

    if (indices.length == 0) {
        messages.textContent = "Sorry! Couldn't find suggestions for you.";
        return;
    }
    var count = document.createElement("em");
    count.textContent = "(" + indices.length + ")";
    node.getElementsByTagName("h2")[0].appendChild(count);

    // FIXME: make this a hide; Also should be changed on any errors...
    // Just dump the error message here!
    messages.textContent = '';
    for (i in indices) {
        var content = document.createElement("li"),
            link = document.createElement("a"),
            icon = document.createElement("span"),
            owner = document.createElement("span"),
            name = document.createElement("span"),
            arrow = document.createElement("span"),
            repo = repos[indices[i]];

        icon.className = "mini-icon mini-icon-public-repo";
        link.appendChild(icon);
        owner.className = "owner";
        owner.textContent = repo.owner+"/";
        link.appendChild(owner);
        name.className = "repo";
        name.textContent = repo.name;
        link.appendChild(name);
        arrow.className = "arrow";
        link.appendChild(arrow);
        link.href = repo.url;
        content.className = "public source";
        content.appendChild(link);
        repo_list.appendChild(content);

    }

};

run();
