// UpennLPS HW6 GifTastic
// Author: Kevin Wang
// Date due: 2019/03/02

//office hour question: on off, download, spam bug

var main = {
    // check arrays for favorite related items
    favorite: [],
    favoritedIndex: [],
    // some global parameters
    topic: ["cat", "dog", "mouse", "asmondgold", "frozen"],   //array to created buttons and used for q param in queryURL, initiated with some topics to generate some buttons
    limit: 10,                                      //used for the limit parameter in queryURL also for determining offset increments
    api_key: "m1zLhrSg5oQZ4XsPia3CzlHfX6ruOQ43",    //apikey for queryURL
    rating: "",                                     //rating parameter
    offset: 0,                                      //offset parameter
    currentTopic: "",                               //global variable for current topic selected for some references

    // queryURL:"https://api.giphy.com/v1/gifs/search?api_key=m1zLhrSg5oQZ4XsPia3CzlHfX6ruOQ43&q=cat&limit="+main.limit

    makeQueryURL: function (api_key, topic, limit, rating, offset) {
        //function to generate query URL, intakes apikey(required), topic for q param(required), limit for number of image searches, rating for image, and offset.
        var queryURL = "https://api.giphy.com/v1/gifs/search?";
        var queryParam = {};
        queryParam.api_key = api_key;   //required
        queryParam.q = topic;           //required
        queryParam.limit = limit;
        queryParam.rating = rating;
        queryParam.offset = offset;
        return queryURL + $.param(queryParam);
    },

    btnGenerate: function () {
        //generates the topic buttons on the top of the html page
        $("#btnDisplay").empty();
        for (var i = 0; i < main.topic.length; i++) {
            var newBtn = $("<button>")
            newBtn.text(main.topic[i])
            newBtn.addClass("deafultBtn imageCallBtn")
            $("#btnDisplay").append(newBtn)
        }
        $(".imageCallBtn").on("click", function () {
            $(".imageCallBtn").prop("disabled", false)
            $(".imageCallBtn").removeClass("currentTopicBtn")
            $(this).addClass("currentTopicBtn");
            $(this).prop("disabled", true);
            main.offset = 0;
            $("#imageDisplay").empty();
            main.currentTopic = $(this).text();
            main.imgGenerate(main.currentTopic);
            $("#movieSection").hide();
            omdb.getMovieInfo();
        });
    },

    downloadBtnGenerate: function (appendLocation, url) {
        //used to generate a button to download currently not working
        var download = $("<a>")
        download.append("<i class='fas fa-file-download'></i>")
        download.attr("download", url)
        $(appendLocation).append(download);
    },

    findMoreBtnGenerate: function () {
        //creates the find more gif button to request more gifs
        var moreBtn = $("<button>")
        moreBtn.text("find more GIFs");
        moreBtn.addClass("deafultBtn");
        moreBtn.attr("id", "moreBtn");
        $("#imageDisplay").append(moreBtn);
        $("#moreBtn").on("click", function () {
            main.offset += parseInt(main.limit);
            $(this).remove();
            main.imgGenerate(main.currentTopic)
        });
    },

    imgGenerate: function (topic) {
        //call to initiate logic to generate image 
        main.limit = $("#gifNoSelect option:selected").html();
        $.ajax({
            url: main.makeQueryURL(main.api_key, topic, main.limit, main.rating, main.offset),
            method: "GET"
        }).then(function (response) {
            if (response.data.length === 0) {
                var errormsg = $("<h2>").text("Cannot find images")
                errormsg.addClass("errormsg")
                $("#imageDisplay").append(errormsg)

            }
            else {
                // generate main.limit amount of images and assign corresponding attribute
                main.createNImages(topic, response, response.data.length);

                //Apply event listner to add favorite button
                //Whether if document event listner is more efficient?
                $(".addFavBtn").off()
                $(".addFavBtn").on("click", function () {
                    $(this).removeClass("addFavBtn")
                    $(this).addClass("favBtnAdded")
                    $(this).text("Added to Favorites");
                    $(this).prop("disabled", true);
                    var fav = {
                        topic: $(this).parent().children(".gifImg").attr("data-topic"),
                        index: $(this).parent().children(".gifImg").attr("data-index"),
                        rating: $(this).parent().children(".gifImg").attr("data-rating"),
                        still: $(this).parent().children(".gifImg").attr("data-still"),
                        gif: $(this).parent().children(".gifImg").attr("data-gif")
                    };
                    main.favorite.push(fav);
                    localStorage.setItem("favorite", JSON.stringify(main.favorite))
                    main.favoriteGenerate();
                });
                //create the find more button
                main.findMoreBtnGenerate();
            }
        });
    },

    createNImages: function (topic, response, length) {
        //function to create images of length about the topic of choice and response is the ajax JSON of Giphy
        for (var i = 0; i < length; i++) {
            var newDiv = $("<div>");
            newDiv.addClass("imageContainer")
            newDiv.addClass("resultImg")
            var newImage = $("<img>");
            newImage.attr("src", response.data[i].images.fixed_height_still.url);
            newImage.attr("alt", topic + " image");
            newImage.addClass("gifImg");
            newImage.attr("data-state", "still");
            newImage.attr("data-still", response.data[i].images.fixed_height_still.url);
            newImage.attr("data-gif", response.data[i].images.fixed_height.url);
            newImage.attr("data-topic", topic);
            newImage.attr("data-index", parseInt(main.offset) + parseInt(i));
            newImage.attr("data-rating", response.data[i].rating);
            newDiv.append(newImage)
            var newP = $("<p>");
            newP.text("Rating: " + response.data[i].rating);
            newP.addClass("rating");
            newDiv.append(newP);
            var addFavBtn = $("<button>");
            addFavBtn.addClass("addFavBtn")
            // addFavBtn.text("add")
            var str = topic + parseInt(i + main.offset);
            addFavBtn.text("Add to Favorite")
            for (var j = 0; j < main.favoritedIndex.length; j++) {
                if (str === main.favoritedIndex[j]) {
                    addFavBtn.removeClass("addFavBtn")
                    addFavBtn.addClass("favBtnAdded")
                    addFavBtn.text("Added to Favorites")
                    addFavBtn.prop("disabled", true);
                }
            }
            newDiv.append(addFavBtn)
            $("#imageDisplay").append(newDiv);

        }
        //allowing gif and still image interchange
        // $(".gifImg").off()
        // $(".gifImg").on("click", function () {
        //     main.gifChange($(this));
        // })

    },

    favoriteGenerate: function () {
        //Generates images into favorite section taking in data stored in main.favorite
        $("#favorites").empty()
        for (var i = 0; i < main.favorite.length; i++) {
            main.favoritedIndex[i] = main.favorite[i].topic + main.favorite[i].index
            var newDiv = $("<div>");
            newDiv.attr("data-favIndex", i)
            newDiv.addClass("imageContainer");
            var newImage = $("<img>");
            newImage.addClass("gifImg")
            newImage.attr("src", main.favorite[i].still);
            newImage.attr("alt", main.favorite[i].topic + " image");
            newImage.attr("data-state", "still");
            newImage.attr("data-still", main.favorite[i].still);
            newImage.attr("data-gif", main.favorite[i].gif);
            newImage.attr("data-topic", main.favorite[i].topic);
            newImage.attr("data-index", main.favorite[i].index);
            newImage.attr("data-rating", main.favorite[i].rating);
            newDiv.append(newImage)
            var newP = $("<p>");
            newP.text("Rating: " + main.favorite[i].rating);
            newP.addClass("rating");
            newDiv.append(newP);
            var rmvBtn = $("<button>");
            rmvBtn.addClass("rmvBtn");
            rmvBtn.text("Remove");
            newDiv.append(rmvBtn);
            // main.downloadBtnGenerate(newDiv, main.favorite[i].gif);
            $("#favorites").append(newDiv);
        }
        //apply event listners, changed to document
        // $(".gifImg").off()                                              //Office Hour question about off on
        // $(".gifImg").on("click", function () {
        //     main.gifChange($(this));
        // })
        // $(".rmvBtn").on("click", function () {
        //     var rmvIndex=$(this).parent().attr("data-favIndex")
        //     main.favorite.splice(rmvIndex,1);
        //     localStorage.setItem("favorite", JSON.stringify(main.favorite))
        //     main.favoriteGenerate();
        // });

    },



    gifChange: function (gifImg) {      //function that allows the select image to change its src stored in data attributes, used to animate gifs
        if (gifImg.attr("data-state") === "still") {
            gifImg.attr("data-state", "animate");
            gifImg.attr("src", gifImg.attr("data-gif"))
        } else {
            gifImg.attr("data-state", "still");
            gifImg.attr("src", gifImg.attr("data-still"))
        }
    },

    hideShow: function (idBtn, idDiv) {      //function to hide and show the favortie section
        if ($(idBtn).attr("data-dispState") === "show") {
            $(idDiv).hide();
            $(idBtn).text("show [+]")
            $(idBtn).attr("data-dispState", "hide");
        } else {
            $(idDiv).show()
            $(idBtn).text("hide [-]")
            $(idBtn).attr("data-dispState", "show");
        }
    },

    favBtnRestore: function (restoreTopic, restoreIndex) {
        //take current topic of and index of favorited item and check it to the current display to see if a disabled addFavBtn should be re=enabled
        if (restoreTopic == main.currentTopic) {
            $(".resultImg").each(function () {
                if (restoreIndex == $(this).children(".gifImg").attr("data-index")) {
                    $(this).children(".favBtnAdded").text("Add to Favorites");
                    $(this).children(".favBtnAdded").prop("disabled", false);
                    $(this).children(".favBtnAdded").addClass("addFavBtn");
                    $(this).children(".favBtnAdded").removeClass("favBtnAdded");
                }
            })
        }
    },

    closeMovieSection: function () {
        //reenable current topic button and hide movie section
        $("#movieSection").hide()
        $(".imageCallBtn").prop("disabled", false)
    }
}

//  "https://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy";

var omdb = {
    apikey: "trilogy",

    makeQueryURL: function (topic) {
        var queryURL = "https://www.omdbapi.com/?";
        var queryParam = {};
        queryParam.t = topic;
        queryParam.apikey = omdb.apikey;

        return queryURL + $.param(queryParam);
    },

    getMovieInfo: function () {
        $.ajax({
            url: omdb.makeQueryURL(main.currentTopic),
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (response.Response == 'True') {
                $("#movieSection").show();
                $("#movieInfoDisplayContainer").hide();    
                $("#movieInfoDisplay").empty();
                var movieTitle = $("<p>");
                movieTitle.text("Title: " + response.Title);
                var movieRated = $("<p>");
                movieRated.text("Rated: " + response.Rated);
                var movieReleased = $("<p>")
                movieReleased.text("Released: " + response.Released)
                var movieActors = $("<p>")
                movieActors.text("Actors: " + response.Actors)
                $("#movieInfoDisplay").append(movieTitle, movieRated, movieReleased, movieActors);
                $("#movieBarTitle").text("Movie Info on " + response.Title);
            }
        });
    },

}



$(document).ready(function () {
    //Local storage to extend favorite section
    if (localStorage.getItem("favorite") != null) {
        main.favorite = JSON.parse(localStorage.getItem("favorite"));
        main.favoriteGenerate();
    }
    //initial generate of topic buttons
    main.btnGenerate();
    //regenerate of topic buttons once a new topic is added
    $("#submitBtn").on("click", function (event) {
        event.preventDefault();
        var searchedTag = $("#searchInput").val().trim();
        main.topic.push(searchedTag);
        main.btnGenerate();
    });

    //apply event listners
    //allow hide and show of section
    $("#favHS").on("click", function () {
        main.hideShow("#favHS", "#favorites");
    });
    $("#resultHS").on("click", function () {
        main.hideShow("#resultHS", "#imageDisplay");
    });
    $("#movieHS").on("click", function () {
        console.log(1)
        main.hideShow("#movieHS", "#movieInfoDisplayContainer")
    });

    //Remove favorite button
    $("#favorites").on("click", ".rmvBtn", function () {
        //local storage and modify check arrays and refresh html elements
        var rmvIndex = $(this).parent().attr("data-favIndex")
        var restoreTopic = main.favorite[rmvIndex].topic;
        var restoreIndex = main.favorite[rmvIndex].index;
        console.log(restoreTopic);
        console.log(restoreIndex);
        main.favorite.splice(rmvIndex, 1);
        main.favoritedIndex.splice(rmvIndex, 1);
        localStorage.setItem("favorite", JSON.stringify(main.favorite))
        main.favoriteGenerate();
        main.favBtnRestore(restoreTopic, restoreIndex);
    })
    //Gif animation
    $(document).on("click", ".gifImg", function () {
        main.gifChange($(this));
    })

    $(document).on("click", "#closeBtn", main.closeMovieSection)
});


// function readCookie(name) {
//     var nameEQ = name + "=";
//     var ca = document.cookie.split(";");
//     for (var i = 0; i < ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0) === " ") c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) === 0) {
//             return c.substring(nameEQ.length, c.length);
//         }
//     }
//     return null;
// }

// document.cookie = "name=test";
// console.log(readCookie(name));


