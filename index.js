//Global variable declarations
let advanceDetails, artistDisp, artwork, comment, date, deleteFav, dept, detailImg, favoriteForm, favorites, medium, place, searchForm, submitFav, title;

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
    advanceDetails = document.getElementById("advance-details");
}

//add favorite to DB and DOM
function addFavorite(data, form, comment) {
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
        alert("Added to favorites!");
        form.remove();
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

//Create update event listener
function favUpdateEvent(form, favId) {
    form.addEventListener("submit",(e) => {
        e.preventDefault();
        fetch(`http://localhost:3000/favorites/${favId}`, {
            method: "PATCH",
            headers: {
                'Content-Type':'application/json',
                'Accept':'application/json'
            },
            body: JSON.stringify({"comment": e.target.comment.value})
        })
        .then(() => {
            alert("Favorite updated!");
            form.remove();
        })
        .catch((err) => alert(err))
    })
}

//Create delete event listener
function favDeleteEvent(form, button, favId) {
    button.addEventListener("click", () => {
        fetch(`http://localhost:3000/favorites/${favId}`, {
            method: "DELETE",
            headers: {
                'Content-Type':'application/json'
            }
        })
        .then(() => {
            alert("Removed from favorites")
            form.remove();
            favorites.querySelector(`[id="${favId}"]`).remove();
        })
        .catch((err) => alert(err))
    });
}

//Create add event listener
function favAddEvent(obj, form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        addFavorite(obj, form, e.target.comment.value);
    })
}

//Create favorite form
function createForm (fav, artObj) {
    favoriteForm.remove();
    
    favoriteForm = document.createElement("form")
    favoriteForm.id = "favorite-form";
    advanceDetails.appendChild(favoriteForm);
    const label = document.createElement("label");
    label.textContent = "Thoughts on this artwork:";
    comment = document.createElement("textarea");
    comment.id = "comment";
    comment.name = "comment";
    comment.rows = 5;
    comment.form = "favorite-form";
    submitFav = document.createElement("input");
    submitFav.id = "favorite-submit"
    submitFav.type = "submit"
    
    if(JSON.stringify(fav)!=="{}") {
        comment.value = fav.comment;
        deleteFav = document.createElement("button");
        deleteFav.id = "favorite-delete";
        deleteFav.type = "button";
        deleteFav.textContent = "Delete Favorite";
        submitFav.value = "Update Favorite"
        favoriteForm.append(label,comment,submitFav,deleteFav);
        favUpdateEvent(favoriteForm, fav.id);
        favDeleteEvent(favoriteForm, deleteFav, fav.id);
    } else {
        submitFav.value = "Save Favorite";
        favoriteForm.append(label,comment,submitFav);
        favAddEvent(artObj, favoriteForm);
    }
}

//Fetch art by its ID and display additional details to details DOM
function fetchDetails(artId) {
    fetch(`https://api.artic.edu/api/v1/artworks/${artId}`)
    .then((resp) => resp.json())
    .then((json) => {
        const data = json.data;
        favoriteForm.reset();

        //check if artwork being displayed is saved to favorites
        //if favorite, show saved comment in text area and options
        //to update or remove from favorites, if not display empty
        //text area and save favorite submit.
        fetch(`http://localhost:3000/favorites/${artId}`)
        .then((resp) => resp.json())
        .then((fav) => {
            createForm(fav, data);
            detailsDisp(data);
            imageDisp(data.image_id, detailImg, data.alt_text);
            detailImg.classList.add("frame");
        }) 
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