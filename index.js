document.addEventListener("DOMContentLoaded", () => {
    //Save needed DOM elements to variables
    const searchForm = document.getElementById("artist-search");
    const favoriteForm = document.getElementById("favorite-form");
    const artwork = document.getElementById("artwork-list");
    const title = document.getElementById("title");
    const detailImg = document.getElementById("detail-image");
    const dept = document.getElementById("dept");
    const artistDisp = document.getElementById("artist_display");
    const place = document.getElementById("place_of_origin")
    const date = document.getElementById("date_display");
    const medium = document.getElementById("medium_display");
    const themes = document.getElementById("theme_titles");
    const favorites = document.getElementById("favorites");
    const comment = document.getElementById("comment");
    const updateFav = document.getElementById("update-favorite");

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

    //Clear previous artworks from artwork-list.
    //Fetch to artworks endpoint with list of artwork ids
    //Add fetched artworks to artwork-list div with click event listeners
    function fetchArtworks(idString, container) {
        fetch(`https://api.artic.edu/api/v1/artworks?ids=${idString}`)
        .then((resp) => resp.json())
        .then((json) => {
            json.data.forEach((art) => {
                displayArt(art, container);
            })
            
        })
    }

    //Display artwork to DOM
    function displayArt(art, container) {
        const artDiv = document.createElement('div');
        const artTitle = document.createElement('p');
        const artImg = document.createElement('img');
        
        artDiv.id = art.id;
        artDiv.addEventListener("click",() => fetchDetails(artDiv.id));
        if (art.image_id) {
            artImg.src = `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
            artImg.alt = art.alt_text;
        } else {
            artImg.src = "./images/noImageFound.jpeg";
            artImg.alt = 'A man at a painting class has painted his canvas yellow and written "No!". Text on the image reads "No image found for this artwork"';
        }
        artTitle.textContent = art.title;
        artDiv.append(artTitle, artImg);
        container.appendChild(artDiv);
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

    //Fetch art by its ID and display additional details to details DOM
    function fetchDetails(artId) {
        fetch(`https://api.artic.edu/api/v1/artworks/${artId}`)
        .then((resp) => resp.json())
        .then((json) => {
            const data = json.data;
            title.textContent = data.title;
            comment.value = '';
            
            if (data.image_id) {
                detailImg.classList.add("frame");
                detailImg.src = `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`;
                detailImg.alt = data.alt_text;
            } else {
                detailImg.src = "./images/noImageFound.jpeg";
                detailImg.alt = 'A man at a painting class has painted his canvas yellow and written "No!". Text on the image reads "No image found for this artwork"';
            }
            dept.textContent = `Museum department: ${data.department_title}, ${data.department_id}`;
            artistDisp.textContent = `Artist: ${data.artist_display}`;
            place.textContent = `Place of Origin: ${data.place_of_origin}`;
            date.textContent = `Date Created: ${data.date_display}`;
            medium.textContent = `Medium: ${data.medium_display}`;
            if(data.theme_titles[0]) {
                themes.textContent = `Themes: ${data.theme_titles}`;
            } else {
                themes.textContent = "";
            }

            //Add event listener on favorite form submit
            favoriteForm.classList.remove("hidden");
            favoriteForm.addEventListener("submit", (e) => {
                e.preventDefault();
                console.log(data);
                addFavorite(data, e.target.comment.value);
            })

            fetch(`http://localhost:3000/favorites/${artId}`)
            .then((resp) => resp.json())
            .then((data) => {
                if(JSON.stringify(data)!=="{}") {
                    comment.value = data.comment;
                    updateFav.classList.remove("hidden");
                } else {
                    updateFav.classList.add("hidden");
                }
                console.log(json)
            })
        })
    }
})