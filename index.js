document.addEventListener("DOMContentLoaded", () => {
    //Save needed DOM elements to variables
    const searchForm = document.getElementById("artist-search");
    const artwork = document.getElementById("artwork-list");
    const title = document.getElementById("title");
    const detailImg = document.getElementById("detail-image");
    const dept = document.getElementById("dept");
    const artistDisp = document.getElementById("artist_display");
    const place = document.getElementById("place_of_origin")
    const date = document.getElementById("date_display");
    const medium = document.getElementById("medium_display");
    const themes = document.getElementById("theme_titles");

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
                fetchArtworks(artworkIds.join());
                fetchDetails(artworkIds[0]);
            } else {
                alert(`The Chicago Museum of Art collection contains no works by ${e.target.search.value}`);
            }
        })
        searchForm.reset();
    })

    //Clear previous artworks from artwork-list.
    //Fetch to artworks endpoint with list of artwork ids
    //Add fetched artworks to artwork-list div with click event listeners
    function fetchArtworks(idString) {
        artwork.innerHTML = "";
        fetch(`https://api.artic.edu/api/v1/artworks?ids=${idString}`)
        .then((resp) => resp.json())
        .then((json) => {
            json.data.forEach((art) => {
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
                artwork.appendChild(artDiv);
            })
            
        })
    }

    //Fetch art by its ID and display additional details to details DOM
    function fetchDetails(artId) {
        fetch(`https://api.artic.edu/api/v1/artworks/${artId}`)
        .then((resp) => resp.json())
        .then((json) => {
            const data = json.data;
            title.textContent = data.title;
            if (data.image_id) {
                detailImg.src = `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`;
                detailImg.alt = data.alt_text;
            } else {
                detailImg.src = "./images/noImageFound.jpeg";
                detailImg.alt = 'A man at a painting class has painted his canvas yellow and written "No!". Text on the image reads "No image found for this artwork"';
            }
            dept.textContent = `Department: ${data.department_title}, ${data.department_id}`;
            artistDisp.textContent = data.artist_display;
            place.textContent = `${data.place_of_origin}, `;
            date.textContent = data.date_display;
            medium.textContent = data.medium_display;
            if(data.theme_titles[0]) {
                themes.textContent = `Themes: ${data.theme_titles}`;
            } else {
                themes.textContent = "";
            }
        })
    }
})