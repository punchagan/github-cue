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

chrome.extension.sendRequest({ask: "interesting"}, function(response) {

    interestingRepos = response.irepos;
    interestIndices = random_nums(10, interestingRepos.length);

    var suggestion = document.createElement("div");
    suggestion.className = "repos";
    suggestion.id = "details";

    var heading = document.createElement("h2");
    var top_bar = document.createElement("div");
    top_bar.className = "top-bar";
    heading.textContent = "Interesting Repositories";
    top_bar.appendChild(heading);
    suggestion.appendChild(top_bar);
    
    var yrepo = document.getElementById("your_repos");
    yrepo.insertAdjacentElement("beforeBegin", suggestion);

    for (repo in interestIndices) {
        var content = document.createElement("div");
        content.className = "message";
        var link = document.createElement("a");
        link.textContent = interestingRepos[interestIndices[repo]].name;
        link.href = interestingRepos[interestIndices[repo]].url;
        content.appendChild(link);
        suggestion.appendChild(content);
    }

    var yrepo = document.getElementById("your_repos");
    yrepo.insertAdjacentElement("beforeBegin", suggestion);
});
