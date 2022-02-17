//Global variable declarations
let artistDisp, artwork, comment, date, deleteFav, dept, detailImg, favoriteForm, favorites, medium, place, searchForm, submitFav, title;

//Function declarations
//Get elements from DOM and save to global variables
function getElements() {
    searchForm = document.getElementById("artist-search");
    favoriteForm = document.getElementById("favorite-form");
    artwork = document.getElementById("artwork-list");
    title = document.getElementById("title");
    detailImg = document.getElementById("detail-image");
    dept = document.getElementById("dept");
    artistDisp = document.getElementById("artist_display");
    place = document.getElementById("place_of_origin")
    date = document.getElementById("date_display");
    medium = document.getElementById("medium_display");
    themes = document.getElementById("theme_titles");
    favorites = document.getElementById("favorites");
    comment = document.getElementById("comment");
    deleteFav = document.getElementById("favorite-delete");
    submitFav = document.getElementById("favorite-submit");
}

//add favorite to DB and DOM
function addFavorite(data, comment) {
    fetch(`http://localhost:3000/favorites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({"id": data.id, "comment": comment})
    })
    .then(() => {
        displayArt(data,favorites);
    })
    .catch((err) => alert(err))
}

//Display artwork to DOM, given art json object and the html container to display in
function displayArt(art, container) {
    const artDiv = document.createElement('div');
    const artTitle = document.createElement('p');
    const artImg = document.createElement('img');
    
    artDiv.id = art.id;
    artDiv.addEventListener("click",() => fetchDetails(artDiv.id));
    imageDisp(art.image_id, artImg, art.alt_text);
    artTitle.textContent = art.title;
    artDiv.append(artTitle, artImg);
    container.appendChild(artDiv);
}

//Fetch to artworks endpoint with list of artwork ids
//Add fetched artworks to supplied container with call to displayArt
function fetchArtworks(idString, container) {
    fetch(`https://api.artic.edu/api/v1/artworks?ids=${idString}`)
    .then((resp) => resp.json())
    .then((json) => {
        json.data.forEach((art) => {
            displayArt(art, container);
        })
    })
}
//Image check and display
function imageDisp(imgId, img, altText) {
    if (imgId) {
        img.src = `https://www.artic.edu/iiif/2/${imgId}/full/843,/0/default.jpg`
        img.alt = altText;
    } else {
        img.src = "./images/noImageFound.jpeg";
        img.alt = 'A man at a painting class has painted his canvas yellow and written "No!". Text on the image reads "No image found for this artwork"';
    }
}

//Display fetched details in detailed display area
function detailsDisp(artObj) {
    title.textContent = artObj.title;
    comment.value = '';
    dept.textContent = `Museum department: ${artObj.department_title}, ${artObj.department_id}`;
    artistDisp.textContent = `Artist: ${artObj.artist_display}`;
    place.textContent = `Place of Origin: ${artObj.place_of_origin}`;
    date.textContent = `Date Created: ${artObj.date_display}`;
    medium.textContent = `Medium: ${artObj.medium_display}`;
    if(artObj.theme_titles[0]) {
        themes.textContent = `Themes: ${artObj.theme_titles}`;
    } else {
        themes.textContent = "";
    }

}

//Fetch art by its ID and display additional details to details DOM
function fetchDetails(artId) {
    fetch(`https://api.artic.edu/api/v1/artworks/${artId}`)
    .then((resp) => resp.json())
    .then((json) => {
        const data = json.data;
        detailsDisp(data);
        imageDisp(data.image_id, detailImg, data.alt_text);
        if (data.image_id) {
            detailImg.classList.add("frame");
        }
        
        //check if artwork being displayed is saved to favorites
        //if favorite, show saved comment in text area and options
        //to update or remove from favorites, if not display empty
        //text area and save favorite submit.
        fetch(`http://localhost:3000/favorites/${artId}`)
        .then((resp) => resp.json())
        .then((data) => {
            if(JSON.stringify(data)!=="{}") {
                comment.value = data.comment;
                deleteFav.classList.remove("hidden");
                submitFav.value = "Update Favorite"
            } else {
                deleteFav.className = "hidden";
                submitFav.value = "Save Favorite"
                //Add event listener on favorite form submit
                /* was hoping moving this into the else statement would fix the bug where
                the currently displayed artwork, as well as all the previously displayed
                artworks are saved to the db as favorites with the input comment
                but it didn't I suppose because they all had event listeners created. Right now
                the only solution I can think of is deleting the form to start, and then creating
                it anew for each display but I don't love that... maybe if I wrap the event listener in
                the addFavorite function or display function instead of leaving it in this fetch... */
                favoriteForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    console.log(data);
                    if (submitFav.value === "Save Favorite"){
                        console.log("gonna call function to add fav");
                        addFavorite(data, e.target.comment.value);
                    } else {
                        console.log("gonna write function to patch favorite");
                    }
                })
            }
            console.log(json)
        })
        //display form
        favoriteForm.classList.remove("hidden");

        /*
        //Add event listener on favorite form submit
        favoriteForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log(data);
            if (submitFav.value === "Save Favorite"){
                console.log("gonna call function to add fav");
                addFavorite(data, e.target.comment.value);
            } else {
                console.log("gonna write function to patch favorite");
            }
        })
*/
        
    })
}

document.addEventListener("DOMContentLoaded", () => {
    getElements();

    //fetch favorites and display to favorites div
    fetch(`http://localhost:3000/favorites`)
    .then((resp) => resp.json())
    .then((json) => {
        const favIds = [];
        json.forEach((fav) => {
            favIds.push(fav.id);
        })
        if (favIds.join() !== "") {
            favorites.innerHTML = "<h2>Favorited Works</h2>";
            fetchArtworks(favIds.join(), favorites);
        }
    })
    
    //Add event listener on search form submit
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const artist = e.target.search.value.toLowerCase();
        //fetch to artworks/search endpoint to find id's of artworks by requested artist
        fetch(`https://api.artic.edu/api/v1/artworks/search?q=${artist}&limit=100&fields=id,artist_title`)
        .then((resp) => resp.json())
        .then((json) => {
            let i = 0;
            const artworkIds = [];
            let jsonArtist;

            //loops through up to 100 id, artist_title elements returned by fetch to check if artist_title is set.
            //If artist_title is not null, checks if case insensitive text input from search form is contained by
            //case insensitive artist_title. If contained, adds artwork id to array for next fetch. When ten matches
            //are found or the end of the json.data is reached, loop ends.
            while ((artworkIds.length < 10) && (i < json.data.length)) {
                if (json.data[i].artist_title) {
                    jsonArtist = json.data[i].artist_title.toLowerCase();
                    if (jsonArtist.includes(artist)) {
                        console.log("matching artist:",json.data[i].artist_title);
                        artworkIds.push(json.data[i].id)
                    }
                }
                i++;
            }
            //if the array isn't empty, call the function to fetch the artworks and add them to the DOM
            if (artworkIds.join() !== "") {
                artwork.innerHTML = "<h2>Artwork Collection</h2>";
                fetchArtworks(artworkIds.join(), artwork);
                fetchDetails(artworkIds[0]);
            } else {
                alert(`The Chicago Museum of Art collection contains no works by ${artist}`);
            }
        })
        searchForm.reset();
    })
})